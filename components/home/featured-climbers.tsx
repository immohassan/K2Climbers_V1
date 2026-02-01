import { FeaturedClimbersClient } from "./featured-climbers-client"
import { prisma } from "@/lib/prisma"
import { recordCountsAsSummit } from "@/lib/summit-utils"

async function getFeaturedClimbers() {
  try {
    const climbers = await prisma.user.findMany({
      where: { featured: true },
      include: {
        summitRecords: {
          where: { status: "SUCCESSFUL" },
          include: {
            expedition: { select: { category: true } },
          },
        },
        _count: {
          select: { summitRecords: true },
        },
      },
      take: 6,
      orderBy: { updatedAt: "desc" },
    })
    // Only SMALL_PEAKS and MOUNTAINEERING count toward summit count
    return climbers.map((c) => ({
      ...c,
      summitCount: c.summitRecords.filter((r) =>
        recordCountsAsSummit(r.expedition.category)
      ).length,
    }))
  } catch (error) {
    console.error("Error fetching climbers:", error)
    return []
  }
}

export async function FeaturedClimbers() {
  const climbers = await getFeaturedClimbers()

  return <FeaturedClimbersClient climbers={climbers} />
}
