import { prisma } from "./prisma"

const ABOUT_KEYS = [
  "about_us_text",
  "about_us_founder_1_image",
  "about_us_founder_2_image",
  "about_us_founder_3_image",
  "about_us_founder_1_name",
  "about_us_founder_2_name",
  "about_us_founder_3_name",
] as const

const DEFAULT_ABOUT_TEXT =
  "The company's expertise lies in Road tours, treks, Hiking, Climbing and also expedition assistance in Gilgit Baltistan KPK & In Kashmir Pakistan.\n\nOur company is equally involved in tourism-related activities throughout Pakistan with the same volume.\n\nWe have team from young minds to experienced team members, the company understands the strengths, weaknesses and most importantly the potential-for-improvement of tourism industry in Pakistan."

export type AboutUsData = {
  text: string
  founder1Image: string | null
  founder2Image: string | null
  founder3Image: string | null
  founder1Name: string
  founder2Name: string
  founder3Name: string
}

export async function getAboutUsData(): Promise<AboutUsData> {
  try {
    const rows = await prisma.siteSettings.findMany({
      where: { key: { in: [...ABOUT_KEYS] } },
    })
    const get = (key: string) => rows.find((r) => r.key === key)?.value ?? ""
    const text = get("about_us_text")?.trim() || DEFAULT_ABOUT_TEXT
    const founder1Image = get("about_us_founder_1_image") || null
    const founder2Image = get("about_us_founder_2_image") || null
    const founder3Image = get("about_us_founder_3_image") || null
    return {
      text,
      founder1Image: founder1Image || null,
      founder2Image: founder2Image || null,
      founder3Image: founder3Image || null,
      founder1Name: get("about_us_founder_1_name") || "",
      founder2Name: get("about_us_founder_2_name") || "",
      founder3Name: get("about_us_founder_3_name") || "",
    }
  } catch (error) {
    console.error("Error fetching about-us settings:", error)
    return {
      text: DEFAULT_ABOUT_TEXT,
      founder1Image: null,
      founder2Image: null,
      founder3Image: null,
      founder1Name: "",
      founder2Name: "",
      founder3Name: "",
    }
  }
}

const HOME_VIDEO_KEY = "home_video_url"

export async function getHomeVideoUrl(): Promise<string | null> {
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { key: HOME_VIDEO_KEY },
    })
    const url = row?.value?.trim() || null
    return url || null
  } catch (error) {
    console.error("Error fetching home video URL:", error)
    return null
  }
}
