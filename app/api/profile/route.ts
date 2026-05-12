import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { validate, updateProfileSchema } from "@/lib/validation"
import { passwordLimiter } from "@/lib/rate-limit"
import { revalidatePath } from "next/cache"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        bio: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { summitRecords: true, bookings: true, certificates: true, rentals: true },
        },
        summitRecords: {
          include: {
            expedition: {
              select: { id: true, title: true, slug: true, altitude: true, category: true },
            },
          },
          orderBy: { summitDate: "desc" },
        },
        bookings: {
          include: {
            expedition: { select: { title: true, slug: true, heroImage: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        certificates: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const limited = passwordLimiter(request)
  if (limited) return limited

  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const parsed = validate(updateProfileSchema, body)
    if (!parsed.ok) return parsed.response
    const { name, bio, phone, image, password } = parsed.data

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (phone !== undefined) updateData.phone = phone
    if (image !== undefined) updateData.image = image
    if (password) updateData.password = await bcrypt.hash(password, 10)

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true, email: true, name: true, role: true,
        image: true, bio: true, phone: true, createdAt: true,
      },
    })

    revalidatePath("/profile")
    revalidatePath("/climbers")
    revalidatePath(`/climbers/${session.user.id}`)

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
