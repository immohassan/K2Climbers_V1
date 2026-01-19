import { FeaturedClimbersClient } from "./featured-climbers-client"
import { prisma } from "@/lib/prisma"

async function getFeaturedClimbers() {
  try {
    const climbers = await prisma.user.findMany({
      where: {
        role: "CLIMBER",
        summitRecords: {
          some: {
            status: "SUCCESSFUL",
          },
        },
      },
      include: {
        summitRecords: {
          where: { status: "SUCCESSFUL" },
        },
        _count: {
          select: {
            summitRecords: {
              where: { status: "SUCCESSFUL" },
            },
          },
        },
      },
      take: 6,
      orderBy: {
        summitRecords: {
          _count: "desc",
        },
      },
    })
    return climbers
  } catch (error) {
    console.error("Error fetching climbers:", error)
    return []
  }
}

export async function FeaturedClimbers() {
  const climbers = await getFeaturedClimbers()

  return <FeaturedClimbersClient climbers={climbers} />
}
