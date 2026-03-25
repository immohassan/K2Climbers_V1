import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET all slots for an expedition (public)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const slots = await prisma.expeditionSlot.findMany({
      where: { expeditionId: params.id, isActive: true },
      orderBy: { startDate: "asc" },
    })
    return NextResponse.json(slots)
  } catch (error) {
    console.error("Error fetching slots:", error)
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 })
  }
}

// POST create a new slot (admin only)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json()
    const { startDate, endDate, label, maxParticipants, priceOverride } = body

    if (!startDate || !endDate || !maxParticipants) {
      return NextResponse.json({ error: "startDate, endDate, and maxParticipants are required" }, { status: 400 })
    }

    const slot = await prisma.expeditionSlot.create({
      data: {
        expeditionId: params.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        label: label || null,
        maxParticipants: parseInt(maxParticipants),
        priceOverride: priceOverride ? parseFloat(priceOverride) : null,
      },
    })

    return NextResponse.json(slot, { status: 201 })
  } catch (error) {
    console.error("Error creating slot:", error)
    return NextResponse.json({ error: "Failed to create slot" }, { status: 500 })
  }
}
