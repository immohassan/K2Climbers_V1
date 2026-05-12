import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const code = request.nextUrl.searchParams.get("code")?.trim().toUpperCase()
    if (!code) return NextResponse.json({ error: "Coupon code is required" }, { status: 400 })

    const coupon = await prisma.coupon.findUnique({ where: { code } })

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, error: "Invalid or inactive coupon code" })
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "This coupon has expired" })
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit" })
    }

    // Check if coupon is restricted to specific users
    if (coupon.allowedUserIds.length > 0 && !coupon.allowedUserIds.includes(session.user.id)) {
      return NextResponse.json({ valid: false, error: "This coupon is not valid for your account" })
    }

    // Check if user has already used this coupon
    const alreadyUsed = await prisma.couponUsage.findUnique({
      where: { couponId_userId: { couponId: coupon.id, userId: session.user.id } },
    })
    if (alreadyUsed) {
      return NextResponse.json({ valid: false, error: "You have already used this coupon" })
    }

    return NextResponse.json({
      valid: true,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description,
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
}
