import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ExpeditionHeader } from "@/components/expeditions/expedition-header"
import { ExpeditionDetails } from "@/components/expeditions/expedition-details"
import { ExpeditionWeather } from "@/components/expeditions/expedition-weather"
import { ExpeditionItinerary } from "@/components/expeditions/expedition-itinerary"
import { ExpeditionRequiredGear } from "@/components/expeditions/expedition-required-gear"
import { BookingPanel } from "@/components/expeditions/booking-panel"
import { Navbar } from "@/components/navbar"

async function getExpedition(slug: string) {
  try {
    const expedition = await prisma.expedition.findUnique({
      where: { slug },
      include: {
        itineraries: {
          orderBy: { dayNumber: "asc" },
        },
        requiredGear: {
          include: {
            product: true,
          },
        },
        summitRecords: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    })
    return expedition
  } catch (error) {
    console.error("Error fetching expedition:", error)
    return null
  }
}

export default async function ExpeditionPage({
  params,
}: {
  params: { slug: string }
}) {
  const expedition = await getExpedition(params.slug)

  if (!expedition) {
    notFound()
  }

  const successfulSummits = expedition.summitRecords.filter(
    (r) => r.status === "SUCCESSFUL"
  ).length
  const successRate = expedition.successRate ? expedition.successRate : 85;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-14 sm:pt-16 overflow-x-hidden">
        <ExpeditionHeader expedition={expedition} successRate={successRate} />
        <div className="container mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:py-8 lg:py-12">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="min-w-0 space-y-4 sm:space-y-6 lg:col-span-2 lg:space-y-8">
              <ExpeditionDetails expedition={expedition} />
              <ExpeditionWeather
                latitude={(expedition as { latitude?: number | null }).latitude ?? null}
                longitude={(expedition as { longitude?: number | null }).longitude ?? null}
                locationName={expedition.location}
              />
              <ExpeditionItinerary itineraries={expedition.itineraries} />
              <ExpeditionRequiredGear requiredGear={expedition.requiredGear} />
            </div>
            <div className="min-w-0 lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <BookingPanel expedition={expedition} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
