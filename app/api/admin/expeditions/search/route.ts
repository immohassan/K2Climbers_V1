import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const q = new URL(request.url).searchParams.get("q") ?? ""

  const expeditions = await prisma.expedition.findMany({
    where: q ? { title: { contains: q, mode: "insensitive" } } : {},
    select: { id: true, title: true, altitude: true, location: true, _count: { select: { slots: true } } },
    orderBy: { title: "asc" },
    take: 20,
  })

  return NextResponse.json(expeditions)
}
