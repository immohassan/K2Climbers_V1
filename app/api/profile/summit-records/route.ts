import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { validate, createSummitRecordSchema } from "@/lib/validation"
import { generalWriteLimiter } from "@/lib/rate-limit"
import { revalidatePath } from "next/cache"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const records = await prisma.summitRecord.findMany({
      where: { userId: session.user.id },
      include: {
        expedition: {
          select: { id: true, title: true, slug: true, altitude: true, category: true },
        },
      },
      orderBy: { summitDate: "desc" },
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error("Error fetching summit records:", error)
    return NextResponse.json({ error: "Failed to fetch summit records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const limited = generalWriteLimiter(request)
  if (limited) return limited

  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const parsed = validate(createSummitRecordSchema, body)
    if (!parsed.ok) return parsed.response
    const { expeditionId, status, summitDate, notes } = parsed.data

    const expedition = await prisma.expedition.findUnique({
      where: { id: expeditionId },
      select: { id: true, altitude: true, title: true },
    })
    if (!expedition) return NextResponse.json({ error: "Expedition not found" }, { status: 404 })

    const record = await prisma.summitRecord.create({
      data: {
        userId: session.user.id,
        expeditionId: expedition.id,
        status: status ?? "SUCCESSFUL",
        summitDate: summitDate ? new Date(summitDate) : null,
        altitude: expedition.altitude,
        notes: notes ?? null,
      },
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
    console.error("Error creating summit record:", error)
    return NextResponse.json({ error: "Failed to create summit record" }, { status: 500 })
  }
}
