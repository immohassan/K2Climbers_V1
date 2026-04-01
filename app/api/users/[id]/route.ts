import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { recordCountsAsSummit } from "@/lib/summit-utils"
import { validate, updateUserSchema } from "@/lib/validation"
import { revalidatePath } from "next/cache"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, role: true, image: true,
        bio: true, phone: true, featured: true, createdAt: true,
        _count: { select: { summitRecords: true, bookings: true, certificates: true, rentals: true } },
        summitRecords: {
          where: { status: "SUCCESSFUL" },
          include: { expedition: { select: { category: true } } },
        },
      },
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { summitRecords, ...rest } = user
    const summitCount = summitRecords.filter((r) =>
      recordCountsAsSummit(r.expedition.category)
    ).length

    return NextResponse.json({ ...rest, summitCount })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
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

    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const body = await request.json()
    const parsed = validate(updateUserSchema, body)
    if (!parsed.ok) return parsed.response
    const { email, name, role, bio, phone, image, featured, password } = parsed.data

    const updateData: Record<string, unknown> = {}
    if (email !== undefined) updateData.email = email
    if (name !== undefined) updateData.name = name
    if (role !== undefined) updateData.role = role
    if (bio !== undefined) updateData.bio = bio
    if (phone !== undefined) updateData.phone = phone
    if (image !== undefined) updateData.image = image
    if (featured !== undefined) updateData.featured = Boolean(featured)
    if (password) updateData.password = await bcrypt.hash(password, 10)

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, email: true, name: true, role: true,
        image: true, bio: true, phone: true, featured: true, createdAt: true,
      },
    })

    // Bust caches whenever featured status or role changes
    if (featured !== undefined) {
      revalidatePath("/")
      revalidatePath("/climbers")
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Only super admins can delete users." },
        { status: 401 }
      )
    }

    const { id } = await params

    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    await prisma.user.delete({ where: { id } })

    revalidatePath("/")
    revalidatePath("/climbers")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
