import { Mountain, MapPin, Clock, TrendingUp } from "lucide-react"

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
    <div className="relative flex min-h-[260px] items-end sm:min-h-[340px] sm:h-[48vh] md:min-h-[400px] md:h-[52vh]">
      {expedition.heroImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${expedition.heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        </>
      )}
      {!expedition.heroImage && (
        <div className="absolute inset-0 bg-card" />
      )}

      <div className="relative z-10 w-full">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 pb-8 sm:pb-10 md:pb-12">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-400/80 mb-3">
            {expedition.difficulty} · Expedition
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white mb-4 max-w-3xl">
            {expedition.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-white/55 font-mono tracking-wider">
            <span className="flex items-center gap-1.5">
              <Mountain className="h-3 w-3" />{expedition.altitude.toLocaleString()}m
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />{expedition.duration} days
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />{expedition.location}
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" />{successRate.toFixed(0)}% success rate
            </span>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-20"
        style={{ background: "linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 100%)" }}
      />
    </div>
  )
}
