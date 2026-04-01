import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

function adminOnly() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string; slotId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
    if (!isAdmin) return adminOnly()

    const body = await request.json()
    const { startDate, endDate, label, maxParticipants, priceOverride, isActive } = body

    const slot = await prisma.expeditionSlot.update({
      where: { id: params.slotId },
      data: {
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(label !== undefined && { label: label || null }),
        ...(maxParticipants !== undefined && { maxParticipants: parseInt(maxParticipants) }),
        ...(priceOverride !== undefined && { priceOverride: priceOverride ? parseFloat(priceOverride) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    const expedition = await prisma.expedition.findUnique({ where: { id: params.id }, select: { slug: true } })
    if (expedition) revalidatePath(`/expeditions/${expedition.slug}`)
    revalidatePath("/expeditions")

    return NextResponse.json(slot)
  } catch (error) {
    console.error("Error updating slot:", error)
    return NextResponse.json({ error: "Failed to update slot" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; slotId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
    if (!isAdmin) return adminOnly()

    // Block deletion if the slot has active (non-cancelled) bookings
    const activeBookings = await prisma.booking.count({
      where: { slotId: params.slotId, status: { not: "CANCELLED" } },
    })
    if (activeBookings > 0) {
      return NextResponse.json(
        { error: `Cannot delete slot with ${activeBookings} active booking${activeBookings !== 1 ? "s" : ""}` },
        { status: 409 }
      )
    }

    await prisma.expeditionSlot.delete({ where: { id: params.slotId } })

    const expedition = await prisma.expedition.findUnique({ where: { id: params.id }, select: { slug: true } })
    if (expedition) revalidatePath(`/expeditions/${expedition.slug}`)
    revalidatePath("/expeditions")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting slot:", error)
    return NextResponse.json({ error: "Failed to delete slot" }, { status: 500 })
  }
}
