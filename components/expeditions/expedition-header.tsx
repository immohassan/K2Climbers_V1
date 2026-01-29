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
    <div className="relative flex min-h-[220px] items-end sm:min-h-[300px] sm:h-[45vh] md:min-h-[380px] md:h-[50vh] lg:min-h-[450px] lg:h-[55vh]">
      {expedition.heroImage && (
        <>
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${expedition.heroImage})` }}
          />
        </>
      )}
      <div className="relative z-20 w-full min-w-0">
        <div className="container mx-auto max-w-3xl px-3 pb-4 pt-2 sm:px-4 sm:pb-6 md:pb-8 lg:pb-12">
          <h1 className="mb-2 line-clamp-3 text-xl font-bold leading-tight text-white sm:mb-3 sm:text-2xl md:text-3xl md:line-clamp-none lg:text-4xl xl:text-5xl 2xl:text-6xl">
            {expedition.title}
          </h1>
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-white/90 sm:gap-x-4 sm:gap-y-2 sm:text-sm md:gap-x-5 md:text-base">
            <div className="flex shrink-0 items-center">
              <Mountain className="mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              <span className="whitespace-nowrap">{expedition.altitude}m</span>
            </div>
            <div className="flex shrink-0 items-center">
              <Calendar className="mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              <span className="whitespace-nowrap">{expedition.duration} days</span>
            </div>
            <div className="flex min-w-0 shrink items-center overflow-hidden">
              <MapPin className="mr-1 h-3.5 w-3.5 shrink-0 sm:mr-1.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              <span className="truncate">{expedition.location}</span>
            </div>
            <div className="flex shrink-0 items-center">
              <TrendingUp className="mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              <span className="whitespace-nowrap">{successRate.toFixed(1)}% success</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
