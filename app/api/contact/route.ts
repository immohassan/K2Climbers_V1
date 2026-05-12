import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validate, contactSchema } from "@/lib/validation"
import { contactLimiter } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const limited = contactLimiter(request)
  if (limited) return limited

  try {
    const body = await request.json()
    const parsed = validate(contactSchema, body)
    if (!parsed.ok) return parsed.response
    const { name, email, subject, message } = parsed.data

    await prisma.contactMessage.create({
      data: { name, email, subject: subject || null, message },
    })

    return NextResponse.json(
      { success: true, message: "Thank you! Your message has been sent." },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error saving contact message:", error)
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    )
  }
}
