import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { validate, updateCouponSchema } from "@/lib/validation"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: { select: { usages: true, bookings: true } },
        usages: {
          include: { coupon: false },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    })

    if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Error fetching coupon:", error)
    return NextResponse.json({ error: "Failed to fetch coupon" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.coupon.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Coupon not found" }, { status: 404 })

    const body = await request.json()
    const parsed = validate(updateCouponSchema, body)
    if (!parsed.ok) return parsed.response

    const { code, description, discountType, discountValue, maxUses, expiresAt, isActive, allowedUserIds } = parsed.data

    if (discountType === "PERCENTAGE" && discountValue !== undefined && discountValue > 100) {
      return NextResponse.json({ error: "Percentage discount cannot exceed 100" }, { status: 400 })
    }

    // If changing code, check it's not taken by another coupon
    if (code && code !== existing.code) {
      const taken = await prisma.coupon.findUnique({ where: { code } })
      if (taken) return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 })
    }

    if (allowedUserIds && allowedUserIds.length > 0) {
      const count = await prisma.user.count({ where: { id: { in: allowedUserIds } } })
      if (count !== allowedUserIds.length) {
        return NextResponse.json({ error: "One or more user IDs are invalid" }, { status: 400 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (code !== undefined) updateData.code = code
    if (description !== undefined) updateData.description = description
    if (discountType !== undefined) updateData.discountType = discountType
    if (discountValue !== undefined) updateData.discountValue = discountValue
    if (maxUses !== undefined) updateData.maxUses = maxUses
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null
    if (isActive !== undefined) updateData.isActive = isActive
    if (allowedUserIds !== undefined) updateData.allowedUserIds = allowedUserIds

    const coupon = await prisma.coupon.update({ where: { id }, data: updateData })

    revalidatePath("/dashboard/coupons")
    revalidatePath(`/dashboard/coupons/${id}`)

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Error updating coupon:", error)
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only super admins can delete coupons" }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.coupon.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Coupon not found" }, { status: 404 })

    await prisma.coupon.delete({ where: { id } })

    revalidatePath("/dashboard/coupons")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 })
  }
}
