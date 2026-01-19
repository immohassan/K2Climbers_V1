import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ExpeditionHeader } from "@/components/expeditions/expedition-header"
import { ExpeditionDetails } from "@/components/expeditions/expedition-details"
import { ExpeditionItinerary } from "@/components/expeditions/expedition-itinerary"
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
  const successRate =
    expedition.summitRecords.length > 0
      ? (successfulSummits / expedition.summitRecords.length) * 100
      : 0

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <ExpeditionHeader expedition={expedition} successRate={successRate} />
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <ExpeditionDetails expedition={expedition} />
              <ExpeditionItinerary itineraries={expedition.itineraries} />
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BookingPanel expedition={expedition} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
