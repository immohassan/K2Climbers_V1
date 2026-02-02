import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { ClimberProfile } from "@/components/community/climber-profile"
import { prisma } from "@/lib/prisma"
import { recordCountsAsSummit } from "@/lib/summit-utils"

async function getClimber(id: string) {
  try {
    const climber = await prisma.user.findUnique({
      where: { id },
      include: {
        summitRecords: {
          include: {
            expedition: {
              select: {
                id: true,
                title: true,
                slug: true,
                altitude: true,
                category: true,
                heroImage: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        certificates: {
          orderBy: { createdAt: "desc" },
        },
      },
    })
    return climber
  } catch (error) {
    console.error("Error fetching climber:", error)
    return null
  }
}

export default async function ClimberPage({
  params,
}: {
  params: { id: string }
}) {
  const climber = await getClimber(params.id)

  if (!climber || climber.role !== "CLIMBER") {
    notFound()
  }

  // Only SMALL_PEAKS and MOUNTAINEERING count toward summit count
  const successfulSummits = climber.summitRecords.filter(
    (r) =>
      r.status === "SUCCESSFUL" &&
      recordCountsAsSummit(r.expedition.category)
  )
  const highestAltitude = successfulSummits.length > 0
    ? Math.max(...successfulSummits.map((r) => r.altitude))
    : 0

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-12">
          <ClimberProfile
            climber={climber}
            successfulSummits={successfulSummits.length}
            highestAltitude={highestAltitude}
          />
        </div>
      </main>
    </>
  )
}
