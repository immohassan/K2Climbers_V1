import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const [
      totalExpeditions,
      totalBookings,
      totalRevenue,
      totalClimbers,
      totalSummits,
      successfulSummits,
      totalProducts,
      activeRentals,
    ] = await Promise.all([
      prisma.expedition.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { totalAmount: true },
      }),
      prisma.user.count({ where: { role: "CLIMBER" } }),
      prisma.summitRecord.count(),
      prisma.summitRecord.count({ where: { status: "SUCCESSFUL" } }),
      prisma.product.count(),
      prisma.rental.count({ where: { status: "RENTED" } }),
    ])

    const successRate = totalSummits > 0 
      ? (successfulSummits / totalSummits) * 100 
      : 0

    const stats = {
      expeditions: totalExpeditions,
      bookings: totalBookings,
      revenue: totalRevenue._sum.totalAmount || 0,
      climbers: totalClimbers,
      summits: totalSummits,
      successRate: Math.round(successRate * 10) / 10,
      products: totalProducts,
      rentals: activeRentals,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
