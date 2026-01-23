import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Mountain as MountainIcon } from "lucide-react"

interface Itinerary {
  id: string
  dayNumber: number
  title: string
  description: string
  altitude: number | null
  activities: string[]
}

export function ExpeditionItinerary({ itineraries }: { itineraries: Itinerary[] }) {
  if (itineraries.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Itinerary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-6">
          {itineraries.map((day) => (
            <div key={day.id} className="border-l-2 border-glacier-500 pl-3 sm:pl-4 md:pl-6 pb-4 sm:pb-6 last:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <h3 className="font-semibold text-base sm:text-lg leading-tight">
                  Day {day.dayNumber}: {day.title}
                </h3>
                {day.altitude && (
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                    <MountainIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {day.altitude}m
                  </div>
                )}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-2 sm:mb-3 leading-relaxed">{day.description}</p>
              {day.activities.length > 0 && (
                <ul className="list-disc list-inside text-xs sm:text-sm text-muted-foreground space-y-1">
                  {day.activities.map((activity, idx) => (
                    <li key={idx}>{activity}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
