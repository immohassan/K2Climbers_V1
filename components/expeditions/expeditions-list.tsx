import Link from "next/link"
import Image from "next/image"
import { Mountain, MapPin, Clock, ArrowUpRight } from "lucide-react"
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
      <div className="py-20 text-center">
        <p className="text-muted-foreground">No expeditions available at the moment.</p>
        <p className="text-muted-foreground text-sm mt-1">Check back soon for new adventures.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
      {expeditions.map((expedition) => (
        <Link key={expedition.id} href={`/expeditions/${expedition.slug}`} className="block group bg-background">
          {/* Image */}
          <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: "3/2" }}>
            {expedition.heroImage ? (
              <Image
                src={expedition.heroImage}
                alt={expedition.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Mountain className="h-12 w-12 text-muted-foreground/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            {/* Hover arrow */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/10 backdrop-blur-sm p-1.5">
                <ArrowUpRight className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            {/* Difficulty badge */}
            <div className="absolute top-3 left-3">
              <span className="text-[10px] font-bold tracking-widest uppercase bg-black/40 backdrop-blur-sm text-white/80 px-2 py-1">
                {expedition.difficulty}
              </span>
            </div>
            {/* Price overlay */}
            <div className="absolute bottom-3 right-3 text-right">
              <div className="text-white/40 text-[9px] uppercase tracking-wider">From</div>
              <div className="text-white font-black text-base">{formatCurrency(expedition.basePrice)}</div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 border-b border-border">
            <h3 className="font-black text-base sm:text-lg leading-tight mb-1.5 group-hover:text-orange-500 transition-colors line-clamp-2">
              {expedition.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
              {expedition.shortDescription || expedition.description}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <Mountain className="h-3 w-3" />{expedition.altitude.toLocaleString()}m
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />{expedition.duration} days
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />{expedition.location}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
