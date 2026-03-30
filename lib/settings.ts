import { unstable_cache } from "next/cache"
import { prisma } from "./prisma"

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

const DEFAULT_ABOUT_TEXT =
  "The company's expertise lies in Road tours, treks, Hiking, Climbing and also expedition assistance in Gilgit Baltistan KPK & In Kashmir Pakistan.\n\nOur company is equally involved in tourism-related activities throughout Pakistan with the same volume.\n\nWe have team from young minds to experienced team members, the company understands the strengths, weaknesses and most importantly the potential-for-improvement of tourism industry in Pakistan."

const DEFAULT_MISSION_TEXT =
  "We Want to create an enabling environment for Pakistan's tourism industry by providing facilities that commensurate with our rich cultural heritage, rare archaeological treasures and exquisite environmental beauty.\n\nWe want to Project Pakistan as a tourist friendly destination."

export type AboutUsData = {
  text: string
  mission: string
  founder1Image: string | null
  founder2Image: string | null
  founder3Image: string | null
  founder1Name: string
  founder2Name: string
  founder3Name: string
}

export const getAboutUsData = unstable_cache(
  async (): Promise<AboutUsData> => {
    try {
      const rows = await prisma.siteSettings.findMany({
        where: { key: { in: [...ABOUT_KEYS] } },
      })
      const get = (key: string) => rows.find((r) => r.key === key)?.value ?? ""
      const text = get("about_us_text")?.trim() || DEFAULT_ABOUT_TEXT
      const mission = get("about_us_mission")?.trim() || DEFAULT_MISSION_TEXT
      const founder1Image = get("about_us_founder_1_image") || null
      const founder2Image = get("about_us_founder_2_image") || null
      const founder3Image = get("about_us_founder_3_image") || null
      return {
        text,
        mission,
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
        mission: DEFAULT_MISSION_TEXT,
        founder1Image: null,
        founder2Image: null,
        founder3Image: null,
        founder1Name: "",
        founder2Name: "",
        founder3Name: "",
      }
    }
  },
  ["about-us"],
  { revalidate: 86400, tags: ["about-us"] }
)

const HOME_VIDEO_KEY = "home_video_url"
const SITE_LOGO_KEY = "site_logo"

export const getSiteLogoUrl = unstable_cache(
  async (): Promise<string | null> => {
    try {
      const row = await prisma.siteSettings.findUnique({
        where: { key: SITE_LOGO_KEY },
      })
      const url = row?.value?.trim() || null
      return url || null
    } catch (error) {
      console.error("Error fetching site logo:", error)
      return null
    }
  },
  ["site-logo"],
  { revalidate: 86400, tags: ["site-logo"] }
)

export const getHomeVideoUrl = unstable_cache(
  async (): Promise<string | null> => {
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
  },
  ["home-video"],
  { revalidate: 86400, tags: ["home-video"] }
)

export type TestimonialData = {
  id: string
  name: string
  role: string | null
  content: string
  imageUrl: string | null
  order: number
}

export const getTestimonials = unstable_cache(
  async (): Promise<TestimonialData[]> => {
    try {
      const list = await prisma.testimonial.findMany({
        orderBy: { order: "asc" },
      })
      return list
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      return []
    }
  },
  ["testimonials"],
  { revalidate: 3600, tags: ["testimonials"] }
)
