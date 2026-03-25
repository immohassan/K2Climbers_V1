import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
    const { searchParams } = new URL(request.url)
    const slotId = searchParams.get("slotId")

    const where: any = isAdmin ? {} : { userId: session.user.id }
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
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { expeditionId, slotId, numberOfPeople, specialRequests } = body

    const expedition = await prisma.expedition.findUnique({ where: { id: expeditionId } })
    if (!expedition) return NextResponse.json({ error: "Expedition not found" }, { status: 404 })

    // Validate slot if provided
    if (slotId) {
      const slot = await prisma.expeditionSlot.findUnique({ where: { id: slotId } })
      if (!slot || !slot.isActive) return NextResponse.json({ error: "Slot not found or inactive" }, { status: 404 })
      const available = slot.maxParticipants - slot.bookedCount
      if (numberOfPeople > available) {
        return NextResponse.json({ error: `Only ${available} spot${available !== 1 ? "s" : ""} remaining in this slot` }, { status: 400 })
      }
    }

    // Determine price (slot override takes precedence)
    let pricePerPerson = expedition.basePrice
    if (slotId) {
      const slot = await prisma.expeditionSlot.findUnique({ where: { id: slotId } })
      if (slot?.priceOverride) pricePerPerson = slot.priceOverride
    }

    const totalAmount = pricePerPerson * numberOfPeople

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        expeditionId,
        slotId: slotId || null,
        numberOfPeople,
        totalAmount,
        specialRequests,
      },
      include: { expedition: true },
    })

    // Increment bookedCount on the slot
    if (slotId) {
      await prisma.expeditionSlot.update({
        where: { id: slotId },
        data: { bookedCount: { increment: numberOfPeople } },
      })
    }

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
