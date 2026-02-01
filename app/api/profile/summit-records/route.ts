import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const records = await prisma.summitRecord.findMany({
      where: { userId: session.user.id },
      include: {
        expedition: {
          select: {
            id: true,
            title: true,
            slug: true,
            altitude: true,
            category: true,
          },
        },
      },
      orderBy: { summitDate: "desc" },
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error("Error fetching summit records:", error)
    return NextResponse.json(
      { error: "Failed to fetch summit records" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { expeditionId, status = "SUCCESSFUL", summitDate, notes } = body

    if (!expeditionId) {
      return NextResponse.json(
        { error: "expeditionId is required" },
        { status: 400 }
      )
    }

    const expedition = await prisma.expedition.findUnique({
      where: { id: expeditionId },
      select: { id: true, altitude: true, title: true },
    })

    if (!expedition) {
      return NextResponse.json(
        { error: "Expedition not found" },
        { status: 404 }
      )
    }

    const record = await prisma.summitRecord.create({
      data: {
        userId: session.user.id,
        expeditionId: expedition.id,
        status: status === "FAILED" ? "FAILED" : status === "IN_PROGRESS" ? "IN_PROGRESS" : "SUCCESSFUL",
        summitDate: summitDate ? new Date(summitDate) : null,
        altitude: expedition.altitude,
        notes: notes ?? null,
      },
      include: {
        expedition: {
          select: {
            id: true,
            title: true,
            slug: true,
            altitude: true,
            category: true,
          },
        },
      },
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error("Error creating summit record:", error)
    return NextResponse.json(
      { error: "Failed to create summit record" },
      { status: 500 }
    )
  }
}
