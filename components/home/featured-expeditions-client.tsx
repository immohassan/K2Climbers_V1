"use client"

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
  successRate: number | null
  guides: Array<{ name: string | null; image: string | null }>
}

export function FeaturedExpeditionsClient({ expeditions }: { expeditions: Expedition[] }) {
  if (expeditions.length === 0) {
    return (
      <section className="py-16 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <SectionLabel />
          <p className="text-muted-foreground mt-8">No expeditions available yet.</p>
        </div>
      </section>
    )
  }

  const [featured, ...rest] = expeditions

  return (
    <section className="py-14 md:py-20 bg-background border-b border-border">
      <div className="container mx-auto px-4">

        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <SectionLabel />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none mt-2">
              Featured<br className="hidden sm:block" /> Expeditions
            </h2>
          </div>
          <Link
            href="/expeditions"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-400 transition-colors group"
          >
            All expeditions
            <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Editorial grid: 1 large + 2 stacked */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-border">

          {/* Featured — large left */}
          <div className="md:col-span-3 bg-background">
            <Link href={`/expeditions/${featured.slug}`} className="block group h-full">
              <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: "4/3" }}>
                {featured.heroImage ? (
                  <Image
                    src={featured.heroImage}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-700"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-card">
                    <Mountain className="h-20 w-20 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-black text-xl sm:text-2xl md:text-3xl leading-tight mb-2 line-clamp-2">
                        {featured.title}
                      </h3>
                      <p className="text-white/55 text-sm line-clamp-2 mb-4 max-w-md">
                        {featured.shortDescription || featured.description}
                      </p>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/50 font-mono">
                        <span className="flex items-center gap-1.5">
                          <Mountain className="h-3 w-3" />{featured.altitude.toLocaleString()}m
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />{featured.duration} days
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" />{featured.location}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-white/40 text-[10px] uppercase tracking-wider mb-0.5">From</div>
                      <div className="text-white font-black text-lg sm:text-xl">{formatCurrency(featured.basePrice)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Right column — stacked small cards */}
          <div className="md:col-span-2 flex flex-col gap-px bg-border">
            {rest.slice(0, 2).map((expedition) => (
              <div key={expedition.id} className="flex-1 bg-background">
                <Link href={`/expeditions/${expedition.slug}`} className="block group h-full">
                  <div className="relative overflow-hidden bg-muted h-full min-h-[200px]">
                    {expedition.heroImage ? (
                      <Image
                        src={expedition.heroImage}
                        alt={expedition.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 40vw"
                        className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-card">
                        <Mountain className="h-12 w-12 text-muted-foreground/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                      <h3 className="text-white font-black text-base sm:text-lg leading-tight line-clamp-2 mb-2">
                        {expedition.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3 text-[10px] text-white/45 font-mono">
                          <span className="flex items-center gap-1">
                            <Mountain className="h-2.5 w-2.5" />{expedition.altitude.toLocaleString()}m
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />{expedition.duration}d
                          </span>
                        </div>
                        <div className="text-white font-bold text-sm">{formatCurrency(expedition.basePrice)}</div>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/10 backdrop-blur-sm p-1.5">
                        <ArrowUpRight className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile view-all link */}
        <div className="mt-6 sm:hidden">
          <Link
            href="/expeditions"
            className="flex items-center justify-center gap-2 text-sm font-semibold border border-border py-3 text-foreground hover:bg-muted/50 transition-colors"
          >
            View All Expeditions
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function SectionLabel() {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div className="w-3 h-3 bg-orange-500" />
      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">Expeditions</span>
    </div>
  )
}
