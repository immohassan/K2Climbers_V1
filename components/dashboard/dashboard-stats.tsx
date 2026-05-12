"use client"

import { useEffect, useState } from "react"
import { Mountain, DollarSign, Users, TrendingUp, Award } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Stats {
  expeditions: number
  bookings: number
  revenue: number
  climbers: number
  summits: number
  successRate: number
  products: number
  rentals: number
}

const SKELETON = "animate-pulse bg-muted rounded h-7 w-16"

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const cards = stats
    ? [
        { label: "Expeditions", value: stats.expeditions, icon: Mountain, color: "text-blue-400", sub: "active listings" },
        { label: "Total Bookings", value: stats.bookings, icon: TrendingUp, color: "text-orange-500", sub: "all time" },
        { label: "Revenue", value: formatCurrency(stats.revenue), icon: DollarSign, color: "text-green-400", sub: "total collected" },
        { label: "Climbers", value: stats.climbers, icon: Users, color: "text-purple-400", sub: "registered users" },
        { label: "Success Rate", value: `${stats.successRate}%`, icon: Award, color: "text-yellow-400", sub: "summit success" },
      ]
    : []

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-border border border-border">
      {loading
        ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-background px-4 py-5 space-y-2">
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              <div className="h-7 w-14 bg-muted rounded animate-pulse" />
              <div className="h-2.5 w-16 bg-muted/60 rounded animate-pulse" />
            </div>
          ))
        : cards.map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} className="bg-background px-4 py-5 group">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">{label}</p>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-2xl font-black tabular-nums">{value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
            </div>
          ))}
    </div>
  )
}
