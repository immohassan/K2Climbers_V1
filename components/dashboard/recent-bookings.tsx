"use client"

import { useEffect, useState } from "react"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Users } from "lucide-react"

interface Booking {
  id: string
  numberOfPeople: number
  totalAmount: number
  status: string
  createdAt: string
  expedition: { title: string }
  user: { name: string; email: string }
}

const STATUS: Record<string, string> = {
  CONFIRMED: "bg-green-500/10 text-green-500",
  PENDING:   "bg-yellow-500/10 text-yellow-500",
  CANCELLED: "bg-red-500/10 text-red-500",
}

export function RecentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => { setBookings(d.slice(0, 6)); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-500 mb-0.5">Bookings</p>
          <h2 className="text-base font-black">Recent Bookings</h2>
        </div>
        <span className="text-xs text-muted-foreground">Last 6</span>
      </div>

      {loading ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-3 animate-pulse">
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-muted rounded w-40" />
                <div className="h-2.5 bg-muted/60 rounded w-28" />
              </div>
              <div className="h-3.5 bg-muted rounded w-20" />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-muted-foreground">No bookings yet.</div>
      ) : (
        <div className="divide-y divide-border">
          {bookings.map((b) => (
            <div key={b.id} className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-muted/20 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{b.expedition.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {b.user.name || b.user.email} &middot; {b.numberOfPeople}p
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{formatDate(b.createdAt)}</p>
              </div>
              <div className="text-right shrink-0 space-y-1.5">
                <p className="text-sm font-black">{formatCurrency(b.totalAmount)}</p>
                <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 ${STATUS[b.status] ?? "bg-muted text-muted-foreground"}`}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
