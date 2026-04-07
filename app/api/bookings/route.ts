import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { validate, createBookingSchema } from "@/lib/validation"
import { bookingLimiter } from "@/lib/rate-limit"
import { sendBookingConfirmationEmail } from "@/lib/email"
import { revalidatePath } from "next/cache"

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
    const { expeditionId, slotId, numberOfPeople, specialRequests, couponCode } = parsed.data

    const expedition = await prisma.expedition.findUnique({ where: { id: expeditionId } })
    if (!expedition) return NextResponse.json({ error: "Expedition not found" }, { status: 404 })

    // Validate slot exists and is active before entering the transaction
    if (slotId) {
      const slot = await prisma.expeditionSlot.findUnique({ where: { id: slotId } })
      if (!slot || !slot.isActive)
        return NextResponse.json({ error: "Slot not found or inactive" }, { status: 404 })
    }

    // Validate coupon before entering the transaction
    let couponRecord: { id: string; discountType: string; discountValue: number } | null = null
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })

      if (!coupon || !coupon.isActive) {
        return NextResponse.json({ error: "Invalid or inactive coupon code" }, { status: 400 })
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return NextResponse.json({ error: "This coupon has expired" }, { status: 400 })
      }
      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 })
      }
      if (coupon.allowedUserIds.length > 0 && !coupon.allowedUserIds.includes(session.user.id)) {
        return NextResponse.json({ error: "This coupon is not valid for your account" }, { status: 400 })
      }
      const alreadyUsed = await prisma.couponUsage.findUnique({
        where: { couponId_userId: { couponId: coupon.id, userId: session.user.id } },
      })
      if (alreadyUsed) {
        return NextResponse.json({ error: "You have already used this coupon" }, { status: 400 })
      }

      couponRecord = { id: coupon.id, discountType: coupon.discountType, discountValue: coupon.discountValue }
    }

    // discountAmount is calculated inside the tx once the slot price override is known
    let discountAmount = 0

    // Use a serializable transaction scoped only to the slot capacity check + booking creation.
    // Keeping the transaction as short as possible avoids pgBouncer connection recycling on the
    // Supabase transaction pooler (port 6543), which caused "Transaction not found" errors when
    // coupon writes were included inside the same tx.
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

        const subtotal = pricePerPerson * numberOfPeople

        // Final discount calculation using the resolved price per person
        if (couponRecord) {
          discountAmount =
            couponRecord.discountType === "PERCENTAGE"
              ? (subtotal * couponRecord.discountValue) / 100
              : Math.min(couponRecord.discountValue, subtotal)
          discountAmount = Math.round(discountAmount * 100) / 100
        }

        const totalAmount = subtotal - discountAmount

        return tx.booking.create({
          data: {
            userId: session.user.id,
            expeditionId,
            slotId: slotId || null,
            numberOfPeople,
            totalAmount,
            discountAmount,
            couponId: couponRecord?.id ?? null,
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

    // Record coupon usage AFTER the booking transaction completes.
    // The @@unique([couponId, userId]) constraint on CouponUsage prevents any race-condition
    // double-use — a concurrent request will get a unique-constraint violation before it can
    // create a second usage record for the same user+coupon pair.
    if (couponRecord) {
      await prisma.$transaction([
        prisma.couponUsage.create({
          data: { couponId: couponRecord.id, userId: session.user.id, bookingId: booking.id },
        }),
        prisma.coupon.update({
          where: { id: couponRecord.id },
          data: { usedCount: { increment: 1 } },
        }),
      ])
    }

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

    revalidatePath("/bookings")
    revalidatePath(`/bookings/${booking.id}`)
    revalidatePath("/dashboard/bookings")

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    // Surface capacity / slot / coupon errors as 400 rather than 500
    if (error instanceof Error && (
      error.message.includes("fully booked") ||
      error.message.includes("spot") ||
      error.message.includes("Slot not found") ||
      error.message.includes("coupon")
    )) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
