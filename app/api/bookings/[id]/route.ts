import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
        user: {
          select: { id: true, name: true, email: true },
        },
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
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json()
    const { status, paymentStatus, specialRequests, numberOfPeople } = body

    const existing = await prisma.booking.findUnique({ where: { id: params.id }, include: { expedition: true } })
    if (!existing) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus
    if (specialRequests !== undefined) updateData.specialRequests = specialRequests
    if (numberOfPeople !== undefined) {
      updateData.numberOfPeople = numberOfPeople
      updateData.totalAmount = existing.expedition.basePrice * numberOfPeople
    }

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
      include: {
        expedition: { select: { id: true, title: true, slug: true, heroImage: true, basePrice: true, altitude: true, duration: true, location: true, difficulty: true } },
        user: { select: { id: true, name: true, email: true } },
        slot: { select: { id: true, startDate: true, endDate: true, label: true, maxParticipants: true, bookedCount: true } },
      },
    })

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

    await prisma.booking.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
  }
}
