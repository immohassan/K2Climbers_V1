import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { randomBytes } from "crypto"

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

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(certificates)
  } catch (error) {
    console.error("Error fetching certificates:", error)
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, expeditionId, summitRecordId, expeditionTitle, peakName, altitude, summitDate } = body

    // Generate unique verification code
    const verificationCode = randomBytes(16).toString("hex")

    const certificate = await prisma.certificate.create({
      data: {
        userId,
        expeditionId,
        summitRecordId,
        expeditionTitle,
        peakName,
        altitude,
        summitDate: new Date(summitDate),
        verificationCode,
      },
    })

    return NextResponse.json(certificate, { status: 201 })
  } catch (error) {
    console.error("Error creating certificate:", error)
    return NextResponse.json(
      { error: "Failed to create certificate" },
      { status: 500 }
    )
  }
}
