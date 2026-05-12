import { NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const HOME_VIDEO_KEY = "home_video_url"

/** Public: get home page video URL */
export async function GET() {
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { key: HOME_VIDEO_KEY },
    })
    const videoUrl = row?.value?.trim() || null
    return NextResponse.json({ videoUrl }, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch (error) {
    console.error("Error fetching home video:", error)
    return NextResponse.json(
      { error: "Failed to fetch home video" },
      { status: 500 }
    )
  }
}

/** Admin only: update home page video URL */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const videoUrl = typeof body.videoUrl === "string" ? body.videoUrl.trim() || null : null

    await prisma.siteSettings.upsert({
      where: { key: HOME_VIDEO_KEY },
      create: { key: HOME_VIDEO_KEY, value: videoUrl ?? "" },
      update: { value: videoUrl ?? "" },
    })

    revalidateTag("home-video")
    return NextResponse.json({ videoUrl })
  } catch (error) {
    console.error("Error updating home video:", error)
    return NextResponse.json(
      { error: "Failed to update home video" },
      { status: 500 }
    )
  }
}
