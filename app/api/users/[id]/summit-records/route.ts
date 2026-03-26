import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

// GET /api/users/[id]/summit-records — admin fetches any user's summit records
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const records = await prisma.summitRecord.findMany({
      where: { userId: params.id },
      include: {
        expedition: {
          select: { id: true, title: true, slug: true, altitude: true, category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Also fetch existing certificates for this user to know which records already have one
    const certs = await prisma.certificate.findMany({
      where: { userId: params.id },
      select: { summitRecordId: true, id: true, verificationCode: true },
    })

    const certsByRecordId = Object.fromEntries(
      certs.filter((c) => c.summitRecordId).map((c) => [c.summitRecordId!, c])
    )

    return NextResponse.json({ records, certsByRecordId })
  } catch (error) {
    console.error("Error fetching summit records:", error)
    return NextResponse.json({ error: "Failed to fetch summit records" }, { status: 500 })
  }
}
