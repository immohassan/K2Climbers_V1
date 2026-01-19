import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
    
    const where: any = isAdmin ? {} : { userId: session.user.id }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        expedition: {
          select: {
            id: true,
            title: true,
            slug: true,
            heroImage: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { expeditionId, numberOfPeople, specialRequests } = body

    const expedition = await prisma.expedition.findUnique({
      where: { id: expeditionId },
    })

    if (!expedition) {
      return NextResponse.json(
        { error: "Expedition not found" },
        { status: 404 }
      )
    }

    const totalAmount = expedition.basePrice * numberOfPeople

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        expeditionId,
        numberOfPeople,
        totalAmount,
        specialRequests,
      },
      include: {
        expedition: true,
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    )
  }
}
