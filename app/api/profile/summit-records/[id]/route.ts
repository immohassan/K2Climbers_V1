import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const record = await prisma.summitRecord.findFirst({
      where: { id, userId: session.user.id },
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

    if (!record) {
      return NextResponse.json({ error: "Summit record not found" }, { status: 404 })
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error("Error fetching summit record:", error)
    return NextResponse.json(
      { error: "Failed to fetch summit record" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.summitRecord.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Summit record not found" }, { status: 404 })
    }

    const body = await request.json()
    const { expeditionId, status, summitDate, notes } = body

    let altitude = existing.altitude
    let expeditionIdToUse = existing.expeditionId

    if (expeditionId != null && expeditionId !== existing.expeditionId) {
      const expedition = await prisma.expedition.findUnique({
        where: { id: expeditionId },
        select: { id: true, altitude: true },
      })
      if (!expedition) {
        return NextResponse.json(
          { error: "Expedition not found" },
          { status: 404 }
        )
      }
      altitude = expedition.altitude
      expeditionIdToUse = expedition.id
    }

    const updateData: {
      expeditionId?: string
      status?: "SUCCESSFUL" | "FAILED" | "IN_PROGRESS"
      summitDate?: Date | null
      altitude?: number
      notes?: string | null
    } = {
      expeditionId: expeditionIdToUse,
      altitude,
    }
    if (status !== undefined) {
      updateData.status =
        status === "FAILED" ? "FAILED" : status === "IN_PROGRESS" ? "IN_PROGRESS" : "SUCCESSFUL"
    }
    if (summitDate !== undefined) {
      updateData.summitDate = summitDate ? new Date(summitDate) : null
    }
    if (notes !== undefined) {
      updateData.notes = notes ?? null
    }

    const record = await prisma.summitRecord.update({
      where: { id },
      data: updateData,
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
    console.error("Error updating summit record:", error)
    return NextResponse.json(
      { error: "Failed to update summit record" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.summitRecord.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Summit record not found" }, { status: 404 })
    }

    await prisma.summitRecord.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting summit record:", error)
    return NextResponse.json(
      { error: "Failed to delete summit record" },
      { status: 500 }
    )
  }
}
