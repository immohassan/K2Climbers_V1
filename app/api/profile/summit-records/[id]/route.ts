import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { validate, updateSummitRecordSchema } from "@/lib/validation"
import { revalidatePath } from "next/cache"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const record = await prisma.summitRecord.findFirst({
      where: { id, userId: session.user.id },
      include: {
        expedition: {
          select: { id: true, title: true, slug: true, altitude: true, category: true },
        },
      },
    })

    if (!record) return NextResponse.json({ error: "Summit record not found" }, { status: 404 })

    return NextResponse.json(record)
  } catch (error) {
    console.error("Error fetching summit record:", error)
    return NextResponse.json({ error: "Failed to fetch summit record" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const existing = await prisma.summitRecord.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) return NextResponse.json({ error: "Summit record not found" }, { status: 404 })

    const body = await request.json()
    const parsed = validate(updateSummitRecordSchema, body)
    if (!parsed.ok) return parsed.response
    const { expeditionId, status, summitDate, notes } = parsed.data

    let altitude = existing.altitude
    let expeditionIdToUse = existing.expeditionId

    if (expeditionId != null && expeditionId !== existing.expeditionId) {
      const expedition = await prisma.expedition.findUnique({
        where: { id: expeditionId },
        select: { id: true, altitude: true },
      })
      if (!expedition) return NextResponse.json({ error: "Expedition not found" }, { status: 404 })
      altitude = expedition.altitude
      expeditionIdToUse = expedition.id
    }

    const updateData: Record<string, unknown> = { expeditionId: expeditionIdToUse, altitude }
    if (status !== undefined) updateData.status = status
    if (summitDate !== undefined) updateData.summitDate = summitDate ? new Date(summitDate) : null
    if (notes !== undefined) updateData.notes = notes ?? null

    const record = await prisma.summitRecord.update({
      where: { id },
      data: updateData,
      include: {
        expedition: {
          select: { id: true, title: true, slug: true, altitude: true, category: true },
        },
      },
    })

    revalidatePath("/profile")
    revalidatePath("/climbers")
    revalidatePath(`/climbers/${session.user.id}`)

    return NextResponse.json(record)
  } catch (error) {
    console.error("Error updating summit record:", error)
    return NextResponse.json({ error: "Failed to update summit record" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const existing = await prisma.summitRecord.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!existing) return NextResponse.json({ error: "Summit record not found" }, { status: 404 })

    await prisma.summitRecord.delete({ where: { id } })

    revalidatePath("/profile")
    revalidatePath("/climbers")
    revalidatePath(`/climbers/${session.user.id}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting summit record:", error)
    return NextResponse.json({ error: "Failed to delete summit record" }, { status: 500 })
  }
}
