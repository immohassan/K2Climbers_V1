"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Mountain, Award, ArrowUpRight, Search, X, Star } from "lucide-react"

interface Climber {
  id: string
  name: string | null
  image: string | null
  bio: string | null
  featured: boolean
  summitCount: number
  totalSummits: number
  certificateCount: number
  highestAltitude: number
}

export function ClimbersList({ climbers }: { climbers: Climber[] }) {
  const [search, setSearch] = useState("")
  const [featuredOnly, setFeaturedOnly] = useState(false)

  const filtered = useMemo(() => {
    return climbers.filter((c) => {
      if (featuredOnly && !c.featured) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !c.name?.toLowerCase().includes(q) &&
          !c.bio?.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [climbers, search, featuredOnly])

  return (
    <div className="space-y-6">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search climbers by name…"
            className="w-full pl-11 pr-10 py-3 border border-border bg-background text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setFeaturedOnly(!featuredOnly)}
          className={`flex items-center gap-2 text-xs font-semibold px-4 py-3 border transition-colors whitespace-nowrap ${
            featuredOnly
              ? "border-orange-500 text-orange-500 bg-orange-500/5"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Star className="h-3.5 w-3.5" />
          Featured only
        </button>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {filtered.length} climber{filtered.length !== 1 ? "s" : ""}
        </span>
        {(search || featuredOnly) && (
          <button
            onClick={() => { setSearch(""); setFeaturedOnly(false) }}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center border border-border">
          <Mountain className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No climbers match your search.</p>
          <button
            onClick={() => { setSearch(""); setFeaturedOnly(false) }}
            className="text-xs text-orange-500 hover:text-orange-400 mt-2 underline underline-offset-2 transition-colors"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {filtered.map((climber) => (
            <Link
              key={climber.id}
              href={`/climbers/${climber.id}`}
              className="group bg-background block hover:bg-card/60 transition-colors"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative h-16 w-16 shrink-0 border border-border overflow-hidden bg-muted">
                    {climber.image ? (
                      <Image
                        src={climber.image}
                        alt={climber.name ?? "Climber"}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-muted-foreground/40">
                        {climber.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-black text-sm truncate group-hover:text-orange-500 transition-colors">
                          {climber.name || "Anonymous Climber"}
                        </p>
                        {climber.featured && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-orange-500 mt-0.5">
                            <Star className="h-2.5 w-2.5 fill-orange-500" />
                            Featured
                          </span>
                        )}
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-border group-hover:text-orange-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5" />
                    </div>

                    {climber.bio && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {climber.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1">
                    <Mountain className="h-3 w-3" />
                    {climber.summitCount} summit{climber.summitCount !== 1 ? "s" : ""}
                  </span>
                  {climber.highestAltitude > 0 && (
                    <span className="flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      {climber.highestAltitude.toLocaleString()}m
                    </span>
                  )}
                  {climber.certificateCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {climber.certificateCount} cert{climber.certificateCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
