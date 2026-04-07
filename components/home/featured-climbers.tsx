import { FeaturedClimbersClient } from "./featured-climbers-client"
import { prisma } from "@/lib/prisma"
import { recordCountsAsSummit } from "@/lib/summit-utils"
import { unstable_cache } from "next/cache"

const getFeaturedClimbers = unstable_cache(
  async () => {
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
  },
  ["featured-climbers"],
  { tags: ["featured-climbers"], revalidate: 300 }
)

export async function FeaturedClimbers() {
  const climbers = await getFeaturedClimbers()

  return <FeaturedClimbersClient climbers={climbers} />
}
