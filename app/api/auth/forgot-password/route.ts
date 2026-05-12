import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"
import { sendPasswordResetEmail } from "@/lib/email"
import { passwordLimiter } from "@/lib/rate-limit"
import { z } from "zod"

const schema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(request: NextRequest) {
  const limited = passwordLimiter(request)
  if (limited) return limited

  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }
    const { email } = parsed.data

    // Always return the same response regardless of whether the email exists
    // to prevent user enumeration attacks
    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      // Delete any existing tokens for this email
      await prisma.passwordResetToken.deleteMany({ where: { email } })

      const token = randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.passwordResetToken.create({
        data: { email, token, expiresAt },
      })

      // Fire and forget — don't await so we respond quickly
      sendPasswordResetEmail(email, token).catch((err) =>
        console.error("Failed to send password reset email:", err)
      )
    }

    return NextResponse.json({
      message: "If an account exists with that email, you'll receive a reset link shortly.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
