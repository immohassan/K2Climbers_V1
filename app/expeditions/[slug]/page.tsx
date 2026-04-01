import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { ExpeditionHeader } from "@/components/expeditions/expedition-header"
import { ExpeditionDetails } from "@/components/expeditions/expedition-details"
import { ExpeditionVideo } from "@/components/expeditions/expedition-video"
import { ExpeditionWeather } from "@/components/expeditions/expedition-weather"
import { ExpeditionItinerary } from "@/components/expeditions/expedition-itinerary"
import { ExpeditionRequiredGear } from "@/components/expeditions/expedition-required-gear"
import { ExpeditionPolicies } from "@/components/expeditions/expedition-policies"
import { BookingPanel } from "@/components/expeditions/booking-panel"
import { ExpeditionMap } from "@/components/expeditions/expedition-map"
import { Navbar } from "@/components/navbar"

export const revalidate = 3600 // revalidate every hour

export async function generateStaticParams() {
  try {
    const expeditions = await prisma.expedition.findMany({
      where: { isActive: true },
      select: { slug: true },
    })
    return expeditions.map((e) => ({ slug: e.slug }))
  } catch {
    return []
  }
}

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

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const expedition = await getExpedition(params.slug)
  if (!expedition) return {}

  const title = expedition.metaTitle || `${expedition.title} | K2 Climbers`
  const description =
    expedition.metaDescription ||
    expedition.shortDescription ||
    `Join K2 Climbers on the ${expedition.title} expedition. ${expedition.altitude}m altitude, ${expedition.duration} days. Book your adventure in Pakistan's mountains.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: expedition.heroImage ? [{ url: expedition.heroImage }] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: expedition.heroImage ? [expedition.heroImage] : [],
    },
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

  const expeditionSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: expedition.title,
    description: expedition.shortDescription || expedition.description,
    url: `https://www.k2climbers.com/expeditions/${expedition.slug}`,
    image: expedition.heroImage || undefined,
    touristType: "Adventure Tourism",
    itinerary: {
      "@type": "ItemList",
      numberOfItems: expedition.duration,
    },
    offers: {
      "@type": "Offer",
      price: expedition.basePrice,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://www.k2climbers.com/expeditions/${expedition.slug}`,
    },
    provider: {
      "@type": "Organization",
      name: "K2 Climbers",
      url: "https://www.k2climbers.com",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(expeditionSchema) }}
      />
      <Navbar />
      <main className="min-h-screen pt-14 sm:pt-16 overflow-x-hidden">
        <ExpeditionHeader expedition={expedition} successRate={successRate} />
        <div className="container mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:py-8 lg:py-12">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="min-w-0 space-y-4 sm:space-y-6 lg:col-span-2 lg:space-y-8">
              <ExpeditionDetails expedition={expedition} />
              <ExpeditionVideo videoUrl={(expedition as { videoUrl?: string | null }).videoUrl ?? null} />
              <ExpeditionWeather
                latitude={(expedition as { latitude?: number | null }).latitude ?? null}
                longitude={(expedition as { longitude?: number | null }).longitude ?? null}
                locationName={expedition.location}
              />
              {(expedition as { latitude?: number | null }).latitude != null &&
               (expedition as { longitude?: number | null }).longitude != null && (
                <ExpeditionMap
                  latitude={(expedition as { latitude: number }).latitude}
                  longitude={(expedition as { longitude: number }).longitude}
                  locationName={expedition.location}
                  peakName={expedition.title}
                />
              )}
              <ExpeditionItinerary itineraries={expedition.itineraries} />
              <ExpeditionRequiredGear
                requiredGear={expedition.requiredGear}
                requiredEquipment={(expedition as any).requiredEquipment ?? null}
              />
              <ExpeditionPolicies
                paymentPolicy={(expedition as any).paymentPolicy ?? null}
                refundPolicy={(expedition as any).refundPolicy ?? null}
              />
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
