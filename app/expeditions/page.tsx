import { ExpeditionsList } from "@/components/expeditions/expeditions-list"
import { prisma } from "@/lib/prisma"

async function getExpeditions() {
  try {
    const expeditions = await prisma.expedition.findMany({
      where: { isActive: true },
      include: {
        // guides: {
        //   select: {
        //     name: true,
        //   },
        //   take: 2,
        // },
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

export default async function ExpeditionsPage() {
  const expeditions = await getExpeditions()

  return (
    <main className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Expeditions & Tours</h1>
          <p className="text-xl text-muted-foreground">
            Discover your next mountaineering adventure
          </p>
        </div>

        <ExpeditionsList expeditions={expeditions} />
      </div>
    </main>
  )
}
