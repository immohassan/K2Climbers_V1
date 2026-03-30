import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { validate, createBookingSchema } from "@/lib/validation"
import { bookingLimiter } from "@/lib/rate-limit"
import { sendBookingConfirmationEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
    const { searchParams } = new URL(request.url)
    const slotId = searchParams.get("slotId")

    const where: Record<string, unknown> = isAdmin ? {} : { userId: session.user.id }
    if (slotId) where.slotId = slotId

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        expedition: {
          select: { id: true, title: true, slug: true, heroImage: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
        slot: {
          select: { id: true, startDate: true, endDate: true, label: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const limited = bookingLimiter(request)
  if (limited) return limited

  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const parsed = validate(createBookingSchema, body)
    if (!parsed.ok) return parsed.response
    const { expeditionId, slotId, numberOfPeople, specialRequests } = parsed.data

    const expedition = await prisma.expedition.findUnique({ where: { id: expeditionId } })
    if (!expedition) return NextResponse.json({ error: "Expedition not found" }, { status: 404 })

    // Validate slot exists and is active before entering the transaction
    if (slotId) {
      const slot = await prisma.expeditionSlot.findUnique({ where: { id: slotId } })
      if (!slot || !slot.isActive)
        return NextResponse.json({ error: "Slot not found or inactive" }, { status: 404 })
    }

    // Use a serializable transaction so the capacity check + increment + booking creation
    // are atomic. This prevents two simultaneous requests from both passing the check.
    const booking = await prisma.$transaction(
      async (tx) => {
        let pricePerPerson = expedition.basePrice

        if (slotId) {
          // Re-read the slot inside the transaction with a row-level lock (via SELECT FOR UPDATE
          // semantics Prisma applies in serializable isolation). This is the canonical way to
          // prevent double-booking without raw SQL.
          const slot = await tx.expeditionSlot.findUnique({ where: { id: slotId } })
          if (!slot || !slot.isActive) throw new Error("Slot not found or inactive")

          const available = slot.maxParticipants - slot.bookedCount
          if (numberOfPeople > available) {
            throw new Error(
              available <= 0
                ? "This slot is fully booked"
                : `Only ${available} spot${available !== 1 ? "s" : ""} remaining in this slot`
            )
          }

          await tx.expeditionSlot.update({
            where: { id: slotId },
            data: { bookedCount: { increment: numberOfPeople } },
          })

          if (slot.priceOverride) pricePerPerson = slot.priceOverride
        }

        const totalAmount = pricePerPerson * numberOfPeople

        return tx.booking.create({
          data: {
            userId: session.user.id,
            expeditionId,
            slotId: slotId || null,
            numberOfPeople,
            totalAmount,
            specialRequests: specialRequests || null,
          },
          include: {
            expedition: { select: { title: true, slug: true } },
            slot: { select: { startDate: true, endDate: true, label: true } },
          },
        })
      },
      { isolationLevel: "Serializable" }
    )

    // Send confirmation email — fire and forget
    sendBookingConfirmationEmail({
      to: session.user.email!,
      name: session.user.name ?? "",
      bookingId: booking.id,
      expeditionTitle: booking.expedition.title,
      expeditionSlug: booking.expedition.slug,
      numberOfPeople: booking.numberOfPeople,
      totalAmount: booking.totalAmount,
      slotStartDate: booking.slot?.startDate?.toISOString(),
      slotEndDate: booking.slot?.endDate?.toISOString(),
      slotLabel: booking.slot?.label ?? undefined,
    }).catch((err) => console.error("Failed to send booking email:", err))

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    // Surface capacity / slot errors as 400 rather than 500
    if (error instanceof Error && (
      error.message.includes("fully booked") ||
      error.message.includes("spot") ||
      error.message.includes("Slot not found")
    )) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
