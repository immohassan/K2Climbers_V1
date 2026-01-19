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
    <div className="relative h-[60vh] min-h-[500px] flex items-end">
      {expedition.heroImage && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${expedition.heroImage})` }}
          />
        </>
      )}
      <div className="relative z-20 container mx-auto px-4 pb-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            {expedition.title}
          </h1>
          <div className="flex flex-wrap gap-6 text-white/90">
            <div className="flex items-center">
              <Mountain className="h-5 w-5 mr-2" />
              {expedition.altitude}m
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {expedition.duration} days
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              {expedition.location}
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              {successRate.toFixed(1)}% success rate
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
