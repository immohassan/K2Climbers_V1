import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { ClimberProfile } from "@/components/community/climber-profile"
import { prisma } from "@/lib/prisma"
import { recordCountsAsSummit } from "@/lib/summit-utils"

export const revalidate = 1800 // revalidate every 30 minutes

export async function generateStaticParams() {
  try {
    const climbers = await prisma.user.findMany({
      where: { role: "CLIMBER", featured: true },
      select: { id: true },
    })
    return climbers.map((c) => ({ id: c.id }))
  } catch {
    return []
  }
}

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

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  try {
    const climber = await prisma.user.findUnique({
      where: { id: params.id },
      select: { name: true, bio: true, image: true },
    })
    if (!climber) return {}
    const name = climber.name || "Climber"
    return {
      title: name,
      description:
        climber.bio ||
        `${name} is a mountaineer in the K2 Climbers community. Explore their summit records and expedition history.`,
      openGraph: {
        title: `${name} | K2 Climbers`,
        description:
          climber.bio ||
          `${name}'s mountaineering profile on K2 Climbers.`,
        // Only use absolute URLs for OG images — relative /api/images paths won't work
        images: climber.image && !climber.image.startsWith("/api/") ? [{ url: climber.image }] : [],
      },
    }
  } catch {
    return {}
  }
}

export default async function ClimberPage({
  params,
}: {
  params: { id: string }
}) {
  const climber = await getClimber(params.id)

  if (!climber) {
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
