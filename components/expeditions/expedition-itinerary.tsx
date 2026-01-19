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
        <div className="space-y-6">
          {itineraries.map((day) => (
            <div key={day.id} className="border-l-2 border-glacier-500 pl-6 pb-6 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">Day {day.dayNumber}: {day.title}</h3>
                {day.altitude && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MountainIcon className="h-4 w-4 mr-1" />
                    {day.altitude}m
                  </div>
                )}
              </div>
              <p className="text-muted-foreground mb-3">{day.description}</p>
              {day.activities.length > 0 && (
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
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
