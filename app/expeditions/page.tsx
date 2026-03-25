import { Suspense } from "react"
import { ExpeditionsList } from "@/components/expeditions/expeditions-list"
import { ExpeditionsSkeleton } from "@/components/expeditions/expeditions-skeleton"
import { Footer } from "@/components/footer"
import { prisma } from "@/lib/prisma"

// Always fetch fresh data so new expeditions show up on deploy (no static cache)
export const dynamic = "force-dynamic"

async function getExpeditions() {
  try {
    const expeditions = await prisma.expedition.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            bookings: true,
            summitRecords: true,
          },
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

async function ExpeditionsContent() {
  const expeditions = await getExpeditions()
  return <ExpeditionsList expeditions={expeditions} />
}

export default function ExpeditionsPage() {
  return (
    <>
      <main className="min-h-screen pt-16">
        <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 max-w-6xl">
          <div className="mb-12 md:mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-3">Expeditions</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Expeditions &amp; Tours
            </h1>
          </div>

          <Suspense fallback={<ExpeditionsSkeleton />}>
            <ExpeditionsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
