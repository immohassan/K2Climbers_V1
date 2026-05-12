"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Mountain } from "lucide-react"

interface Expedition {
  id: string
  title: string
  slug: string
  _count: { bookings: number; summitRecords: number }
}

export function TopExpeditions() {
  const [expeditions, setExpeditions] = useState<Expedition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/expeditions")
      .then((r) => r.json())
      .then((d: Expedition[]) => {
        setExpeditions(d.sort((a, b) => b._count.bookings - a._count.bookings).slice(0, 6))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const max = expeditions[0]?._count.bookings || 1

  return (
    <div className="border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-500 mb-0.5">Performance</p>
          <h2 className="text-base font-black">Top Expeditions</h2>
        </div>
        <Link href="/dashboard/expeditions" className="text-xs text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1">
          View all <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-4 animate-pulse space-y-2">
              <div className="h-3.5 bg-muted rounded w-44" />
              <div className="h-2 bg-muted/60 rounded w-full" />
            </div>
          ))}
        </div>
      ) : expeditions.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-muted-foreground">No expeditions yet.</div>
      ) : (
        <div className="divide-y divide-border">
          {expeditions.map((exp, i) => (
            <Link
              key={exp.id}
              href={`/dashboard/expeditions/${exp.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors group"
            >
              <span className="text-[10px] font-black text-muted-foreground/40 w-4 tabular-nums shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-sm font-semibold truncate group-hover:text-orange-500 transition-colors">{exp.title}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-muted overflow-hidden">
                    <div
                      className="h-full bg-orange-500/70"
                      style={{ width: `${(exp._count.bookings / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                    {exp._count.summitRecords} summits
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black">{exp._count.bookings}</p>
                <p className="text-[10px] text-muted-foreground">bookings</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
