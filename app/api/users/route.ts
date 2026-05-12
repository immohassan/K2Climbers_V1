import { NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { recordCountsAsSummit } from "@/lib/summit-utils"
import { validate, createUserSchema } from "@/lib/validation"

type UserWithSummitRecords = {
  id: string
  email: string
  name: string | null
  role: string
  image: string | null
  featured: boolean
  createdAt: Date
  _count: { summitRecords: number; bookings: number }
  summitRecords: Array<{ expedition: { category: string } }>
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = (await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        featured: true,
        createdAt: true,
        _count: { select: { summitRecords: true, bookings: true } },
        summitRecords: {
          where: { status: "SUCCESSFUL" },
          include: { expedition: { select: { category: true } } },
        },
      } as import("@prisma/client").Prisma.UserSelect,
      orderBy: { createdAt: "desc" },
    })) as unknown as UserWithSummitRecords[]

    const usersWithSummitCount = users.map((u) => {
      const { summitRecords, ...rest } = u
      const summitCount = summitRecords.filter((r) =>
        recordCountsAsSummit(r.expedition.category)
      ).length
      return { ...rest, summitCount }
    })

    return NextResponse.json(usersWithSummitCount)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = validate(createUserSchema, body)
    if (!parsed.ok) return parsed.response
    const { email, password, name, role } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name: name || null, role },
    })

    revalidatePath("/dashboard/users")
    revalidatePath("/climbers")
    revalidateTag("featured-climbers")

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
