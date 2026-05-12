import type { Metadata } from "next"
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ClimbersList } from "@/components/community/climbers-list"
import { recordCountsAsSummit } from "@/lib/summit-utils"

export const revalidate = 3600 // revalidate every hour

export const metadata: Metadata = {
  title: "Our Climbers",
  description:
    "Meet the mountaineers who have summited Pakistan's greatest peaks with K2 Climbers. A community of passionate climbers conquering the Karakoram and Himalaya.",
  alternates: { canonical: "/climbers" },
  openGraph: {
    title: "Our Climbers | K2 Climbers",
    description:
      "Meet the mountaineers who have summited Pakistan's greatest peaks with K2 Climbers.",
    url: "/climbers",
  },
}

async function getAllClimbers() {
  try {
    const climbers = await prisma.user.findMany({
      where: { role: "CLIMBER" },
      include: {
        summitRecords: {
          where: { status: "SUCCESSFUL" },
          include: {
            expedition: { select: { category: true, altitude: true } },
          },
        },
        certificates: { select: { id: true } },
      },
      orderBy: { name: "asc" },
    })

    return climbers.map((c) => {
      const countingSummits = c.summitRecords.filter((r) =>
        recordCountsAsSummit(r.expedition.category)
      )
      const highestAltitude =
        countingSummits.length > 0
          ? Math.max(...countingSummits.map((r) => r.altitude))
          : 0
      return {
        id: c.id,
        name: c.name,
        image: c.image,
        bio: c.bio,
        featured: c.featured,
        summitCount: countingSummits.length,
        totalSummits: c.summitRecords.length,
        certificateCount: c.certificates.length,
        highestAltitude,
      }
    })
  } catch (error) {
    console.error("Error fetching climbers:", error)
    return []
  }
}

export default async function ClimbersPage() {
  const climbers = await getAllClimbers()

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        {/* Page header */}
        <div className="border-b border-border bg-card/30">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-12 md:py-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-3">
              Community
            </p>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-3">
              Our Climbers
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
              Meet the mountaineers who have conquered Pakistan&apos;s greatest peaks with K2 Climbers.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-10 md:py-14">
          <Suspense fallback={<ClimbersListSkeleton />}>
            <ClimbersList climbers={climbers} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}

function ClimbersListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-11 bg-muted animate-pulse w-full" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-background p-5 space-y-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 bg-muted rounded-none" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted w-3/4" />
                <div className="h-3 bg-muted w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
