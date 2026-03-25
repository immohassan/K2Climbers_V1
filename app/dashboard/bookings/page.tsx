"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Users, Mountain, Search, X, ChevronRight } from "lucide-react"
import toast from "react-hot-toast"

interface Slot {
  id: string
  startDate: string
  endDate: string
  label: string | null
}

interface Booking {
  id: string
  numberOfPeople: number
  totalAmount: number
  status: string
  paymentStatus: string
  createdAt: string
  expedition: { id: string; title: string; slug: string }
  user: { id: string; name: string | null; email: string }
  slot: Slot | null
}

function formatSlotDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-green-500/10 text-green-500 border-green-500/30",
  PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/30",
}

const PAYMENT_STYLES: Record<string, string> = {
  PAID: "bg-green-500/10 text-green-500 border-green-500/30",
  PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  REFUNDED: "bg-blue-500/10 text-blue-400 border-blue-400/30",
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [paymentFilter, setPaymentFilter] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings")
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      } else {
        toast.error("Failed to load bookings")
      }
    } catch {
      toast.error("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const filtered = bookings.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false
    if (paymentFilter && b.paymentStatus !== paymentFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !b.user.name?.toLowerCase().includes(q) &&
        !b.user.email.toLowerCase().includes(q) &&
        !b.expedition.title.toLowerCase().includes(q) &&
        !b.id.toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  const totalRevenue = filtered.reduce((sum, b) => sum + b.totalAmount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-500 mb-1">Admin</p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Bookings</h1>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-0.5">Filtered Revenue</p>
          <p className="text-xl font-black text-orange-500">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, expedition…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 text-xs border border-border bg-background focus:outline-none focus:border-orange-500/50 w-64 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Status filter */}
        {["PENDING", "CONFIRMED", "CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? null : s)}
            className={`text-xs font-semibold px-3 py-2 border transition-colors ${
              statusFilter === s ? STATUS_STYLES[s] : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}

        {/* Payment filter */}
        {["PENDING", "PAID", "REFUNDED"].map((p) => (
          <button
            key={p}
            onClick={() => setPaymentFilter(paymentFilter === p ? null : p)}
            className={`text-xs font-semibold px-3 py-2 border transition-colors ${
              paymentFilter === p ? PAYMENT_STYLES[p] : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.charAt(0) + p.slice(1).toLowerCase()} (pay)
          </button>
        ))}

        {(statusFilter || paymentFilter || search) && (
          <button
            onClick={() => { setStatusFilter(null); setPaymentFilter(null); setSearch("") }}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Clear all
          </button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} booking{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="border border-border">
        {/* Header row */}
        <div className="hidden sm:grid grid-cols-[1fr_1.2fr_80px_90px_90px_80px_36px] gap-px bg-border border-b border-border">
          {["Booking Ref", "Expedition", "People", "Total", "Status", "Payment", ""].map((h) => (
            <div key={h} className="bg-card px-4 py-2.5">
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">{h}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-4 py-4 flex gap-4">
                <div className="h-4 w-24 bg-muted animate-pulse" />
                <div className="h-4 w-40 bg-muted animate-pulse" />
                <div className="ml-auto h-4 w-16 bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Mountain className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No bookings found.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((booking) => (
              <Link
                key={booking.id}
                href={`/dashboard/bookings/${booking.id}`}
                className="group flex sm:grid sm:grid-cols-[1fr_1.2fr_80px_90px_90px_80px_36px] gap-px bg-border hover:bg-orange-500/5 transition-colors"
              >
                {/* Mobile: stacked layout */}
                <div className="sm:hidden bg-background w-full px-4 py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black">{booking.id.slice(0, 8).toUpperCase()}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 border ${STATUS_STYLES[booking.status] ?? "border-border text-muted-foreground"}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold leading-tight">{booking.expedition.title}</p>
                  {booking.slot && (
                    <p className="text-[11px] text-orange-500 font-semibold">
                      {booking.slot.label && `${booking.slot.label} · `}
                      {formatSlotDate(booking.slot.startDate)} – {formatSlotDate(booking.slot.endDate)}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{booking.user.name || booking.user.email}</span>
                    <span className="font-black text-foreground">{formatCurrency(booking.totalAmount)}</span>
                  </div>
                </div>

                {/* Desktop: grid cells */}
                <div className="hidden sm:block bg-background px-4 py-3">
                  <p className="font-mono text-xs font-black">{booking.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{booking.user.name || booking.user.email}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatDate(booking.createdAt)}</p>
                </div>
                <div className="hidden sm:flex bg-background px-4 py-3 items-center">
                  <div>
                    <span className="text-sm font-semibold line-clamp-1 leading-snug">{booking.expedition.title}</span>
                    {booking.slot && (
                      <p className="text-[11px] text-orange-500 mt-0.5">
                        {booking.slot.label && `${booking.slot.label} · `}
                        {formatSlotDate(booking.slot.startDate)} – {formatSlotDate(booking.slot.endDate)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="hidden sm:flex bg-background px-4 py-3 items-center">
                  <span className="flex items-center gap-1.5 text-sm">
                    <Users className="h-3 w-3 text-muted-foreground" />{booking.numberOfPeople}
                  </span>
                </div>
                <div className="hidden sm:flex bg-background px-4 py-3 items-center">
                  <span className="text-sm font-black text-orange-500">{formatCurrency(booking.totalAmount)}</span>
                </div>
                <div className="hidden sm:flex bg-background px-4 py-3 items-center">
                  <span className={`text-[10px] font-bold px-2 py-1 border ${STATUS_STYLES[booking.status] ?? "border-border text-muted-foreground"}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="hidden sm:flex bg-background px-4 py-3 items-center">
                  <span className={`text-[10px] font-bold px-2 py-1 border ${PAYMENT_STYLES[booking.paymentStatus] ?? "border-border text-muted-foreground"}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
                <div className="hidden sm:flex bg-background px-4 py-3 items-center justify-center">
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border bg-card/50">
            <span className="text-[11px] text-muted-foreground">{filtered.length} booking{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>
    </div>
  )
}
