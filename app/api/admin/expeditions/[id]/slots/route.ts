import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const slots = await prisma.expeditionSlot.findMany({
    where: { expeditionId: params.id },
    select: {
      id: true,
      label: true,
      startDate: true,
      endDate: true,
      maxParticipants: true,
      bookedCount: true,
      isActive: true,
      _count: { select: { bookings: true } },
    },
    orderBy: { startDate: "asc" },
  })

  return NextResponse.json(slots)
}
