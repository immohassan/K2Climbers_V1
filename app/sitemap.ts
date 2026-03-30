import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

const BASE_URL = "https://www.k2climbers.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/expeditions`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/expeditions/custom`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/climbers`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]

  // Dynamic expedition pages
  let expeditionPages: MetadataRoute.Sitemap = []
  try {
    const expeditions = await prisma.expedition.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    })
    expeditionPages = expeditions.map((e) => ({
      url: `${BASE_URL}/expeditions/${e.slug}`,
      lastModified: e.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  } catch {
    // fail silently — sitemap still works without dynamic pages
  }

  // Dynamic climber profile pages
  let climberPages: MetadataRoute.Sitemap = []
  try {
    const climbers = await prisma.user.findMany({
      where: { role: "CLIMBER" },
      select: { id: true, updatedAt: true },
    })
    climberPages = climbers.map((c) => ({
      url: `${BASE_URL}/climbers/${c.id}`,
      lastModified: c.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }))
  } catch {
    // fail silently
  }

  return [...staticPages, ...expeditionPages, ...climberPages]
}
