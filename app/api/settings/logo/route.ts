import { NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const SITE_LOGO_KEY = "site_logo"

/** Public: get site logo URL */
export async function GET() {
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { key: SITE_LOGO_KEY },
    })
    const logoUrl = row?.value?.trim() || null
    return NextResponse.json({ logoUrl }, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    })
  } catch (error) {
    console.error("Error fetching logo:", error)
    return NextResponse.json(
      { error: "Failed to fetch logo" },
      { status: 500 }
    )
  }
}

/** Admin only: update site logo URL */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const logoUrl = typeof body.logoUrl === "string" ? body.logoUrl.trim() || null : null

    await prisma.siteSettings.upsert({
      where: { key: SITE_LOGO_KEY },
      create: { key: SITE_LOGO_KEY, value: logoUrl ?? "" },
      update: { value: logoUrl ?? "" },
    })

    revalidateTag("site-logo")
    return NextResponse.json({ logoUrl })
  } catch (error) {
    console.error("Error updating logo:", error)
    return NextResponse.json(
      { error: "Failed to update logo" },
      { status: 500 }
    )
  }
}
