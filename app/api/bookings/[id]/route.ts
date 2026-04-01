import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { validate, patchBookingSchema } from "@/lib/validation"
import { sendBookingConfirmedEmail, sendBookingCancelledEmail } from "@/lib/email"
import { revalidatePath } from "next/cache"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"

    const booking = await prisma.booking.findFirst({
      where: isAdmin ? { id: params.id } : { id: params.id, userId: session.user.id },
      include: {
        expedition: {
          select: { id: true, title: true, slug: true, heroImage: true, basePrice: true, altitude: true, duration: true, location: true, difficulty: true },
        },
        user: { select: { id: true, name: true, email: true } },
        slot: {
          select: { id: true, startDate: true, endDate: true, label: true, maxParticipants: true, bookedCount: true },
        },
      },
    })

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"

    // Allow users to cancel their own PENDING bookings
    if (!isAdmin) {
      const body = await request.json()
      if (body.status !== "CANCELLED") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

      const booking = await prisma.booking.findFirst({
        where: { id: params.id, userId: session.user.id },
      })
      if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      if (booking.status !== "PENDING") {
        return NextResponse.json({ error: "Only pending bookings can be cancelled" }, { status: 400 })
      }

      const bookingWithDetails = await prisma.booking.findUnique({
        where: { id: params.id },
        include: {
          expedition: { select: { title: true, slug: true } },
          user: { select: { name: true, email: true } },
          slot: { select: { startDate: true, endDate: true, label: true } },
        },
      })

      const updated = await prisma.$transaction(async (tx) => {
        const result = await tx.booking.update({
          where: { id: params.id },
          data: { status: "CANCELLED" },
        })
        if (booking.slotId) {
          await tx.expeditionSlot.update({
            where: { id: booking.slotId },
            data: { bookedCount: { decrement: booking.numberOfPeople } },
          })
        }
        return result
      })

      if (bookingWithDetails?.user?.email) {
        sendBookingCancelledEmail({
          to: bookingWithDetails.user.email,
          name: bookingWithDetails.user.name ?? "",
          bookingId: params.id,
          expeditionTitle: bookingWithDetails.expedition.title,
          cancelledBy: "user",
        }).catch((err) => console.error("Failed to send cancellation email:", err))
      }

      revalidatePath("/bookings")
      revalidatePath(`/bookings/${params.id}`)
      revalidatePath("/dashboard/bookings")

      return NextResponse.json(updated)
    }

    const body = await request.json()
    const parsed = validate(patchBookingSchema, body)
    if (!parsed.ok) return parsed.response
    const { status, paymentStatus, specialRequests, numberOfPeople } = parsed.data

    const existing = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { expedition: true, slot: true },
    })
    if (!existing) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

    const updateData: Record<string, unknown> = {}
    if (status !== undefined) updateData.status = status
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus
    if (specialRequests !== undefined) updateData.specialRequests = specialRequests
    if (numberOfPeople !== undefined) {
      updateData.numberOfPeople = numberOfPeople
      // Use slot price override if set, otherwise expedition base price
      const pricePerPerson = existing.slot?.priceOverride ?? existing.expedition.basePrice
      updateData.totalAmount = pricePerPerson * numberOfPeople
    }

    // When cancelling a booking that was previously active, free up the slot capacity
    const wasCancelled = existing.status === "CANCELLED"
    const becomingCancelled = status === "CANCELLED" && !wasCancelled

    const booking = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: params.id },
        data: updateData,
        include: {
          expedition: { select: { id: true, title: true, slug: true, heroImage: true, basePrice: true, altitude: true, duration: true, location: true, difficulty: true } },
          user: { select: { id: true, name: true, email: true } },
          slot: { select: { id: true, startDate: true, endDate: true, label: true, maxParticipants: true, bookedCount: true } },
        },
      })

      // Decrement slot capacity when booking transitions to CANCELLED
      if (becomingCancelled && existing.slotId) {
        await tx.expeditionSlot.update({
          where: { id: existing.slotId },
          data: {
            bookedCount: { decrement: existing.numberOfPeople },
          },
        })
      }

      return updated
    })

    // Send status-change emails (fire and forget)
    if (booking.user?.email) {
      if (status === "CONFIRMED" && existing.status !== "CONFIRMED") {
        sendBookingConfirmedEmail({
          to: booking.user.email,
          name: booking.user.name ?? "",
          bookingId: booking.id,
          expeditionTitle: booking.expedition.title,
          expeditionSlug: booking.expedition.slug,
          numberOfPeople: booking.numberOfPeople,
          totalAmount: booking.totalAmount,
          slotStartDate: booking.slot?.startDate?.toISOString(),
          slotEndDate: booking.slot?.endDate?.toISOString(),
          slotLabel: booking.slot?.label ?? undefined,
        }).catch((err) => console.error("Failed to send booking confirmed email:", err))
      } else if (becomingCancelled) {
        sendBookingCancelledEmail({
          to: booking.user.email,
          name: booking.user.name ?? "",
          bookingId: booking.id,
          expeditionTitle: booking.expedition.title,
          cancelledBy: "admin",
        }).catch((err) => console.error("Failed to send cancellation email:", err))
      }
    }

    revalidatePath("/bookings")
    revalidatePath(`/bookings/${params.id}`)
    revalidatePath("/dashboard/bookings")

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // Free up slot capacity when deleting a non-cancelled booking
    const existing = await prisma.booking.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      await tx.booking.delete({ where: { id: params.id } })

      if (existing.slotId && existing.status !== "CANCELLED") {
        await tx.expeditionSlot.update({
          where: { id: existing.slotId },
          data: { bookedCount: { decrement: existing.numberOfPeople } },
        })
      }
    })

    revalidatePath("/bookings")
    revalidatePath("/dashboard/bookings")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
  }
}
