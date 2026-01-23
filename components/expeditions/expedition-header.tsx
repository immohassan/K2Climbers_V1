import { Mountain, MapPin, Calendar, Users, TrendingUp } from "lucide-react"

interface Expedition {
  id: string
  title: string
  description: string
  altitude: number
  duration: number
  location: string
  heroImage: string | null
  difficulty: string
}

interface ExpeditionHeaderProps {
  expedition: Expedition
  successRate: number
}

export function ExpeditionHeader({ expedition, successRate }: ExpeditionHeaderProps) {
  return (
    <div className="relative h-[50vh] sm:h-[60vh] min-h-[300px] sm:min-h-[400px] md:min-h-[500px] flex items-end">
      {expedition.heroImage && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${expedition.heroImage})` }}
          />
        </>
      )}
      <div className="relative z-20 container mx-auto px-3 sm:px-4 pb-6 sm:pb-12">
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 text-white leading-tight">
            {expedition.title}
          </h1>
          <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 text-sm sm:text-base text-white/90">
            <div className="flex items-center">
              <Mountain className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="whitespace-nowrap">{expedition.altitude}m</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="whitespace-nowrap">{expedition.duration} days</span>
            </div>
            <div className="flex items-center min-w-0">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="truncate">{expedition.location}</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="whitespace-nowrap">{successRate.toFixed(1)}% success rate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
