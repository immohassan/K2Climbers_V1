import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const bookings = await prisma.booking.findMany({
    where: { slotId: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      expedition: { select: { id: true, title: true, altitude: true } },
      slot: { select: { startDate: true, endDate: true, label: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  // Fetch certs and summit records in parallel per booking
  const results = await Promise.all(
    bookings.map(async (booking) => {
      const [existingCert, summitRecord] = await Promise.all([
        prisma.certificate.findFirst({
          where: { userId: booking.userId, expeditionId: booking.expeditionId },
          select: { id: true, verificationCode: true },
        }),
        prisma.summitRecord.findFirst({
          where: { userId: booking.userId, expeditionId: booking.expeditionId },
          select: { id: true, status: true, summitDate: true, altitude: true },
        }),
      ])
      return {
        bookingId: booking.id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        numberOfPeople: booking.numberOfPeople,
        user: booking.user,
        expedition: booking.expedition,
        slot: booking.slot,
        certificate: existingCert ?? null,
        summitRecord: summitRecord ?? null,
      }
    })
  )

  return NextResponse.json(results)
}
