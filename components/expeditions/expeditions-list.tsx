"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Mountain, MapPin, Clock, ArrowUpRight, SlidersHorizontal, X, Search } from "lucide-react"
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
  mountainRange: string | null
  successRate: number | null
}

const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT", "EXTREME"]
const CATEGORIES = ["SMALL_PEAKS", "TREKKING_PEAKS", "MOUNTAINEERING", "ROAD_TRIPS", "CUSTOM"]
const RANGES = ["KARAKORAM", "HIMALAYA", "HINDU_KUSH"]

const CATEGORY_LABELS: Record<string, string> = {
  SMALL_PEAKS: "Small Peaks",
  TREKKING_PEAKS: "Trekking",
  MOUNTAINEERING: "Mountaineering",
  ROAD_TRIPS: "Road Trips",
  CUSTOM: "Custom",
}

const RANGE_LABELS: Record<string, string> = {
  KARAKORAM: "Karakoram",
  HIMALAYA: "Himalaya",
  HINDU_KUSH: "Hindu Kush",
}

const RANGE_COLORS: Record<string, string> = {
  KARAKORAM: "border-orange-500 bg-orange-500/10 text-orange-500",
  HIMALAYA: "border-blue-500 bg-blue-500/10 text-blue-400",
  HINDU_KUSH: "border-green-500 bg-green-500/10 text-green-500",
}

const DIFF_COLORS: Record<string, string> = {
  BEGINNER:     "bg-green-500/10 text-green-500 border-green-500/30",
  INTERMEDIATE: "bg-blue-500/10 text-blue-400 border-blue-400/30",
  ADVANCED:     "bg-orange-500/10 text-orange-500 border-orange-500/30",
  EXPERT:       "bg-red-500/10 text-red-500 border-red-500/30",
  EXTREME:      "bg-purple-500/10 text-purple-400 border-purple-400/30",
}

export function ExpeditionsList({ expeditions }: { expeditions: Expedition[] }) {
  const searchParams = useSearchParams()

  const [diffFilter, setDiffFilter] = useState<string | null>(null)
  const [catFilter, setCatFilter] = useState<string | null>(null)
  const [rangeFilter, setRangeFilter] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState("")

  // Read ?range= from URL on mount
  useEffect(() => {
    const r = searchParams.get("range")
    if (r && RANGES.includes(r)) {
      setRangeFilter(r)
      setShowFilters(true)
    }
  }, [searchParams])

  const clearAll = () => { setDiffFilter(null); setCatFilter(null); setRangeFilter(null); setSearch("") }

  const filtered = useMemo(() => {
    return expeditions.filter((e) => {
      if (diffFilter && e.difficulty !== diffFilter) return false
      if (catFilter && e.category !== catFilter) return false
      if (rangeFilter && e.mountainRange !== rangeFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !e.title.toLowerCase().includes(q) &&
          !e.location.toLowerCase().includes(q) &&
          !(e.shortDescription ?? e.description).toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [expeditions, diffFilter, catFilter, rangeFilter, search])

  const activeFiltersCount = (diffFilter ? 1 : 0) + (catFilter ? 1 : 0) + (rangeFilter ? 1 : 0)
  const hasFilters = activeFiltersCount > 0 || search

  const availableDiffs = Array.from(new Set(expeditions.map((e) => e.difficulty)))
  const availableCats = Array.from(new Set(expeditions.map((e) => e.category)))
  const availableRanges = Array.from(new Set(expeditions.map((e) => e.mountainRange).filter(Boolean))) as string[]

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, location…"
          className="w-full pl-11 pr-10 py-3 border border-border bg-background text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 border transition-colors ${
            showFilters || activeFiltersCount > 0
              ? "border-orange-500 text-orange-500 bg-orange-500/5"
              : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-orange-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-black">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Active filter chips */}
        {rangeFilter && (
          <button
            onClick={() => setRangeFilter(null)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border transition-colors ${RANGE_COLORS[rangeFilter] ?? "bg-orange-500/10 text-orange-500 border-orange-500/30"}`}
          >
            {RANGE_LABELS[rangeFilter] ?? rangeFilter}
            <X className="h-3 w-3" />
          </button>
        )}
        {diffFilter && (
          <button
            onClick={() => setDiffFilter(null)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-orange-500/10 text-orange-500 border border-orange-500/30 hover:bg-orange-500/20 transition-colors"
          >
            {diffFilter.charAt(0) + diffFilter.slice(1).toLowerCase()}
            <X className="h-3 w-3" />
          </button>
        )}
        {catFilter && (
          <button
            onClick={() => setCatFilter(null)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-orange-500/10 text-orange-500 border border-orange-500/30 hover:bg-orange-500/20 transition-colors"
          >
            {CATEGORY_LABELS[catFilter] ?? catFilter}
            <X className="h-3 w-3" />
          </button>
        )}

        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
            Clear all
          </button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} expedition{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="border border-border p-5 space-y-5 bg-card/50">
          {/* Mountain Range */}
          {availableRanges.length > 0 && (
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3">Mountain Range</p>
              <div className="flex flex-wrap gap-2">
                {RANGES.filter((r) => availableRanges.includes(r)).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRangeFilter(rangeFilter === r ? null : r)}
                    className={`text-xs font-semibold px-3 py-1.5 border transition-colors ${
                      rangeFilter === r
                        ? RANGE_COLORS[r]
                        : "border-border text-muted-foreground hover:text-foreground hover:border-border/60"
                    }`}
                  >
                    {RANGE_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3">Difficulty</p>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.filter((d) => availableDiffs.includes(d)).map((d) => (
                <button
                  key={d}
                  onClick={() => setDiffFilter(diffFilter === d ? null : d)}
                  className={`text-xs font-semibold px-3 py-1.5 border transition-colors ${
                    diffFilter === d ? DIFF_COLORS[d] : "border-border text-muted-foreground hover:text-foreground hover:border-border/60"
                  }`}
                >
                  {d.charAt(0) + d.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => availableCats.includes(c)).map((c) => (
                <button
                  key={c}
                  onClick={() => setCatFilter(catFilter === c ? null : c)}
                  className={`text-xs font-semibold px-3 py-1.5 border transition-colors ${
                    catFilter === c
                      ? "border-orange-500 bg-orange-500/10 text-orange-500"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-border/60"
                  }`}
                >
                  {CATEGORY_LABELS[c] ?? c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center border border-border">
          <Mountain className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No expeditions match your filters.</p>
          <button onClick={clearAll} className="text-xs text-orange-500 hover:text-orange-400 mt-2 underline underline-offset-2 transition-colors">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {filtered.map((expedition) => (
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
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/10 backdrop-blur-sm p-1.5">
                    <ArrowUpRight className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  <span className="text-[10px] font-bold tracking-widest uppercase bg-black/40 backdrop-blur-sm text-white/80 px-2 py-1">
                    {expedition.difficulty}
                  </span>
                  {expedition.mountainRange && (
                    <span className="text-[10px] font-bold tracking-widest uppercase bg-black/40 backdrop-blur-sm text-white/80 px-2 py-1">
                      {RANGE_LABELS[expedition.mountainRange] ?? expedition.mountainRange}
                    </span>
                  )}
                </div>
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
      )}
    </div>
  )
}
