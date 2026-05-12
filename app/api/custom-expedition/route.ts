import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { validate, customExpeditionSchema } from "@/lib/validation"
import { customExpeditionLimiter } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const limited = customExpeditionLimiter(request)
  if (limited) return limited

  try {
    const session = await getServerSession(authOptions)

    const body = await request.json()
    const parsed = validate(customExpeditionSchema, body)
    if (!parsed.ok) return parsed.response
    const { peakName, location, preferredDates, groupSize, supportLevel, requiredGear, specialRequests } = parsed.data

    const userName = session?.user?.name || "Guest"
    const userEmail = session?.user?.email || "no-email@k2climbers.com"

    const messageLines = [
      `Peak: ${peakName}`,
      `Location: ${location}`,
      `Preferred Date: ${preferredDates || "Not specified"}`,
      `Group Size: ${groupSize}`,
      `Support Level: ${supportLevel}`,
      requiredGear ? `Required Gear: ${requiredGear}` : null,
      specialRequests ? `Special Requests: ${specialRequests}` : null,
    ]
      .filter(Boolean)
      .join("\n")

    await prisma.contactMessage.create({
      data: {
        name: userName,
        email: userEmail,
        subject: `Custom Expedition Request — ${peakName}`,
        message: messageLines,
      },
    })

    return NextResponse.json(
      { success: true, message: "Custom expedition request submitted successfully." },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error saving custom expedition request:", error)
    return NextResponse.json(
      { error: "Failed to submit request. Please try again." },
      { status: 500 }
    )
  }
}
