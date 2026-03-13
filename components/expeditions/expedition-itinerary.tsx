import { Mountain as MountainIcon } from "lucide-react"

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
    <div className="border border-border p-5 sm:p-6">
      <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-6">Itinerary</p>
      <div className="space-y-0">
        {itineraries.map((day, idx) => (
          <div key={day.id} className="border-l border-orange-500/30 pl-5 pb-6 last:pb-0 relative">
            <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-orange-500/60" />
            <div className="flex items-start justify-between gap-4 mb-1.5">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-orange-500/70 mr-2">Day {day.dayNumber}</span>
                <h3 className="font-black text-sm sm:text-base leading-tight inline">{day.title}</h3>
              </div>
              {day.altitude && (
                <div className="flex items-center text-[11px] text-muted-foreground font-mono shrink-0">
                  <MountainIcon className="h-3 w-3 mr-1" />
                  {day.altitude.toLocaleString()}m
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">{day.description}</p>
            {day.activities.length > 0 && (
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {day.activities.map((activity, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-orange-500/50 mt-0.5">–</span>
                    {activity}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
