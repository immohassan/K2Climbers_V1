import { FeaturedExpeditionsClient } from "./featured-expeditions-client"
import { prisma } from "@/lib/prisma"

async function getFeaturedExpeditions() {
  try {
    const expeditions = await prisma.expedition.findMany({
      where: { featured: true, isActive: true },
      take: 3,
      include: {
        guides: {
          select: {
            name: true,
            image: true,
          },
          take: 2,
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return expeditions
  } catch (error) {
    console.error("Error fetching expeditions:", error)
    return []
  }
}

export async function FeaturedExpeditions() {
  const expeditions = await getFeaturedExpeditions()

  return <FeaturedExpeditionsClient expeditions={expeditions} />
}
