import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const body = await request.json()
    const { peakName, location, preferredDates, groupSize, supportLevel, requiredGear, specialRequests } = body

    if (!peakName?.trim() || !location?.trim() || !groupSize || !supportLevel) {
      return NextResponse.json(
        { error: "Peak name, location, group size, and support level are required" },
        { status: 400 }
      )
    }

    const userName = session?.user?.name || "Guest"
    const userEmail = session?.user?.email || "no-email@k2climbers.com"

    const messageLines = [
      `Peak: ${peakName.trim()}`,
      `Location: ${location.trim()}`,
      `Preferred Date: ${preferredDates || "Not specified"}`,
      `Group Size: ${groupSize}`,
      `Support Level: ${supportLevel}`,
      requiredGear?.trim() ? `Required Gear: ${requiredGear.trim()}` : null,
      specialRequests?.trim() ? `Special Requests: ${specialRequests.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n")

    await prisma.contactMessage.create({
      data: {
        name: userName,
        email: userEmail,
        subject: `Custom Expedition Request — ${peakName.trim()}`,
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
