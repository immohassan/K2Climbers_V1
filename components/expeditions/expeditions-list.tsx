import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mountain, MapPin, Calendar, Users, ArrowRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Expedition {
  id: string
  title: string
  slug: string
  shortDescription: string | null
  description: string
  altitude: number
  duration: number
  location: string
  basePrice: number
  heroImage: string | null
  difficulty: string
  category: string
  successRate: number | null
}

export function ExpeditionsList({ expeditions }: { expeditions: Expedition[] }) {
  if (expeditions.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">No expeditions available at the moment.</p>
        <p className="text-muted-foreground mt-2">Check back soon for new adventures!</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {expeditions.map((expedition) => (
        <Card key={expedition.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          {expedition.heroImage && (
            <div
              className="h-48 bg-cover bg-center"
              style={{ backgroundImage: `url(${expedition.heroImage})` }}
            />
          )}
          <CardHeader>
            <CardTitle className="line-clamp-2">{expedition.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {expedition.shortDescription || expedition.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Mountain className="h-4 w-4 mr-2" />
                {expedition.altitude}m
              </div>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                {expedition.duration} days
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                {expedition.location}
              </div>
              {expedition.successRate && (
                <div className="flex items-center text-glacier-400">
                  <Users className="h-4 w-4 mr-2" />
                  {expedition.successRate}% success rate
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-2xl font-bold">
              {formatCurrency(expedition.basePrice)}
            </div>
            <Link href={`/expeditions/${expedition.slug}`}>
              <Button variant="summit">
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
