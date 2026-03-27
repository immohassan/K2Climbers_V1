import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// POST — create or update a summit record for a user + expedition
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { userId, expeditionId, status, summitDate, altitude } = await request.json()

  if (!userId || !expeditionId || !status) {
    return NextResponse.json({ error: "userId, expeditionId and status are required" }, { status: 400 })
  }

  const existing = await prisma.summitRecord.findFirst({
    where: { userId, expeditionId },
  })

  let record
  if (existing) {
    record = await prisma.summitRecord.update({
      where: { id: existing.id },
      data: {
        status,
        summitDate: summitDate ? new Date(summitDate) : existing.summitDate,
        altitude: altitude ?? existing.altitude,
      },
      select: { id: true, status: true, summitDate: true, altitude: true },
    })
  } else {
    // Fetch expedition altitude as fallback
    const expedition = await prisma.expedition.findUnique({
      where: { id: expeditionId },
      select: { altitude: true },
    })
    record = await prisma.summitRecord.create({
      data: {
        userId,
        expeditionId,
        status,
        summitDate: summitDate ? new Date(summitDate) : null,
        altitude: altitude ?? expedition?.altitude ?? 0,
      },
      select: { id: true, status: true, summitDate: true, altitude: true },
    })
  }

  return NextResponse.json(record)
}
