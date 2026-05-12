import { NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { validate, signupSchema } from "@/lib/validation"
import { signupLimiter } from "@/lib/rate-limit"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  const limited = signupLimiter(request)
  if (limited) return limited

  try {
    const body = await request.json()
    const parsed = validate(signupSchema, body)
    if (!parsed.ok) return parsed.response
    const { email, password, name } = parsed.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name: name || null, role: "CLIMBER" },
    })

    revalidatePath("/dashboard/users")
    revalidatePath("/climbers")
    revalidateTag("featured-climbers")

    const { password: _, ...userWithoutPassword } = user

    // Send welcome email — fire and forget
    sendWelcomeEmail(user.email, user.name ?? "").catch((err) =>
      console.error("Failed to send welcome email:", err)
    )

    return NextResponse.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
