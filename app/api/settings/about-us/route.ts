import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const ABOUT_KEYS = [
  "about_us_text",
  "about_us_mission",
  "about_us_founder_1_image",
  "about_us_founder_2_image",
  "about_us_founder_3_image",
  "about_us_founder_1_name",
  "about_us_founder_2_name",
  "about_us_founder_3_name",
] as const

const DEFAULT_TEXT =
  "The company's expertise lies in Road tours, treks, Hiking, Climbing and also expedition assistance in Gilgit Baltistan KPK & In Kashmir Pakistan.\n\nOur company is equally involved in tourism-related activities throughout Pakistan with the same volume.\n\nWe have team from young minds to experienced team members, the company understands the strengths, weaknesses and most importantly the potential-for-improvement of tourism industry in Pakistan."

async function getAboutUsValues(): Promise<Record<string, string>> {
  const rows = await prisma.siteSettings.findMany({
    where: { key: { in: [...ABOUT_KEYS] } },
  })
  const map: Record<string, string> = {}
  for (const k of ABOUT_KEYS) {
    map[k] = rows.find((r) => r.key === k)?.value ?? ""
  }
  if (!map.about_us_text?.trim()) map.about_us_text = DEFAULT_TEXT
  if (!map.about_us_mission?.trim()) {
    map.about_us_mission =
      "We Want to create an enabling environment for Pakistan's tourism industry by providing facilities that commensurate with our rich cultural heritage, rare archaeological treasures and exquisite environmental beauty.\n\nWe want to Project Pakistan as a tourist friendly destination."
  }
  return map
}

/** Public: get about-us content for the home page */
export async function GET() {
  try {
    const values = await getAboutUsValues()
    return NextResponse.json({
      text: values.about_us_text || DEFAULT_TEXT,
      mission: values.about_us_mission || "",
      founder1Image: values.about_us_founder_1_image || null,
      founder2Image: values.about_us_founder_2_image || null,
      founder3Image: values.about_us_founder_3_image || null,
      founder1Name: values.about_us_founder_1_name || "",
      founder2Name: values.about_us_founder_2_name || "",
      founder3Name: values.about_us_founder_3_name || "",
    })
  } catch (error) {
    console.error("Error fetching about-us settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch about-us settings" },
      { status: 500 }
    )
  }
}

/** Admin only: update about-us content */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      text,
      mission,
      founder1Image,
      founder2Image,
      founder3Image,
      founder1Name,
      founder2Name,
      founder3Name,
    } = body

    const updates: { key: string; value: string }[] = [
      { key: "about_us_text", value: typeof text === "string" ? text : "" },
      { key: "about_us_mission", value: typeof mission === "string" ? mission : "" },
      { key: "about_us_founder_1_image", value: founder1Image ?? "" },
      { key: "about_us_founder_2_image", value: founder2Image ?? "" },
      { key: "about_us_founder_3_image", value: founder3Image ?? "" },
      { key: "about_us_founder_1_name", value: founder1Name ?? "" },
      { key: "about_us_founder_2_name", value: founder2Name ?? "" },
      { key: "about_us_founder_3_name", value: founder3Name ?? "" },
    ]

    for (const { key, value } of updates) {
      await prisma.siteSettings.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    }

    const values = await getAboutUsValues()
    return NextResponse.json({
      text: values.about_us_text,
      mission: values.about_us_mission || "",
      founder1Image: values.about_us_founder_1_image || null,
      founder2Image: values.about_us_founder_2_image || null,
      founder3Image: values.about_us_founder_3_image || null,
      founder1Name: values.about_us_founder_1_name || "",
      founder2Name: values.about_us_founder_2_name || "",
      founder3Name: values.about_us_founder_3_name || "",
    })
  } catch (error) {
    console.error("Error updating about-us settings:", error)
    return NextResponse.json(
      { error: "Failed to update about-us settings" },
      { status: 500 }
    )
  }
}
