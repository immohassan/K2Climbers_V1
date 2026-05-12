import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { validate, createCouponSchema } from "@/lib/validation"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const coupons = await prisma.coupon.findMany({
      include: {
        _count: { select: { usages: true, bookings: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(coupons)
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = validate(createCouponSchema, body)
    if (!parsed.ok) return parsed.response

    const { code, description, discountType, discountValue, maxUses, expiresAt, isActive, allowedUserIds } = parsed.data

    // Validate that PERCENTAGE discountValue is between 1-100
    if (discountType === "PERCENTAGE" && discountValue > 100) {
      return NextResponse.json({ error: "Percentage discount cannot exceed 100" }, { status: 400 })
    }

    const existing = await prisma.coupon.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 })
    }

    // Verify all allowedUserIds exist if provided
    if (allowedUserIds && allowedUserIds.length > 0) {
      const count = await prisma.user.count({ where: { id: { in: allowedUserIds } } })
      if (count !== allowedUserIds.length) {
        return NextResponse.json({ error: "One or more user IDs are invalid" }, { status: 400 })
      }
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        description: description || null,
        discountType,
        discountValue,
        maxUses: maxUses || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive ?? true,
        allowedUserIds: allowedUserIds ?? [],
      },
    })

    revalidatePath("/dashboard/coupons")

    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
}
