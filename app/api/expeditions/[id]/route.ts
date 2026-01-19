import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expedition = await prisma.expedition.findUnique({
      where: { id: params.id },
      include: {
        guides: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
        itineraries: {
          orderBy: { dayNumber: "asc" },
        },
        requiredGear: {
          include: {
            product: true,
          },
        },
        summitRecords: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
            summitRecords: true,
          },
        },
      },
    })

    if (!expedition) {
      return NextResponse.json(
        { error: "Expedition not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(expedition)
  } catch (error) {
    console.error("Error fetching expedition:", error)
    return NextResponse.json(
      { error: "Failed to fetch expedition" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const expedition = await prisma.expedition.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json(expedition)
  } catch (error) {
    console.error("Error updating expedition:", error)
    return NextResponse.json(
      { error: "Failed to update expedition" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await prisma.expedition.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting expedition:", error)
    return NextResponse.json(
      { error: "Failed to delete expedition" },
      { status: 500 }
    )
  }
}
