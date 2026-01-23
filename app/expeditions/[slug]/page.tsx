import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ExpeditionHeader } from "@/components/expeditions/expedition-header"
import { ExpeditionDetails } from "@/components/expeditions/expedition-details"
import { ExpeditionItinerary } from "@/components/expeditions/expedition-itinerary"
import { ExpeditionRequiredGear } from "@/components/expeditions/expedition-required-gear"
import { BookingPanel } from "@/components/expeditions/booking-panel"
import { Navbar } from "@/components/navbar"

async function getExpedition(slug: string) {
  try {
    const expedition = await prisma.expedition.findUnique({
      where: { slug },
      include: {
        guides: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
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
      <main className="min-h-screen pt-16">
        <ExpeditionHeader expedition={expedition} successRate={successRate} />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <ExpeditionDetails expedition={expedition} />
              <ExpeditionItinerary itineraries={expedition.itineraries} />
              <ExpeditionRequiredGear requiredGear={expedition.requiredGear} />
            </div>
            <div className="lg:col-span-1">
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
