"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Users, Mountain, Search, X, ChevronRight, ChevronDown } from "lucide-react"
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

function slotLabel(slot: Slot) {
  const dates = `${formatSlotDate(slot.startDate)} – ${formatSlotDate(slot.endDate)}`
  return slot.label ? `${slot.label} · ${dates}` : dates
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
  const [expeditionFilter, setExpeditionFilter] = useState<string | null>(null) // expedition id
  const [slotFilter, setSlotFilter] = useState<string | null>(null)             // slot id

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

  useEffect(() => { fetchBookings() }, [fetchBookings])

  // Unique expeditions derived from loaded bookings
  const expeditions = useMemo(() => {
    const map = new Map<string, { id: string; title: string }>()
    bookings.forEach(b => { if (!map.has(b.expedition.id)) map.set(b.expedition.id, b.expedition) })
    return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title))
  }, [bookings])

  // Slots for the selected expedition, derived from loaded bookings
  const slotsForExpedition = useMemo(() => {
    if (!expeditionFilter) return []
    const map = new Map<string, Slot>()
    bookings
      .filter(b => b.expedition.id === expeditionFilter && b.slot)
      .forEach(b => { if (!map.has(b.slot!.id)) map.set(b.slot!.id, b.slot!) })
    return Array.from(map.values()).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  }, [bookings, expeditionFilter])

  // Reset slot filter when expedition changes
  const handleExpeditionChange = (id: string | null) => {
    setExpeditionFilter(id)
    setSlotFilter(null)
  }

  const filtered = bookings.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false
    if (paymentFilter && b.paymentStatus !== paymentFilter) return false
    if (expeditionFilter && b.expedition.id !== expeditionFilter) return false
    if (slotFilter && b.slot?.id !== slotFilter) return false
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
  const hasActiveFilters = !!(statusFilter || paymentFilter || search || expeditionFilter || slotFilter)

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
      <div className="space-y-2">
        {/* Row 1: search + status + payment */}
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
        </div>

        {/* Row 2: expedition + slot dropdowns */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Expedition select */}
          <div className="relative">
            <select
              value={expeditionFilter ?? ""}
              onChange={(e) => handleExpeditionChange(e.target.value || null)}
              className="appearance-none pl-3 pr-8 py-2 text-xs border border-border bg-background focus:outline-none focus:border-orange-500/50 transition-colors min-w-[200px] text-muted-foreground"
            >
              <option value="">All expeditions</option>
              {expeditions.map(exp => (
                <option key={exp.id} value={exp.id}>{exp.title}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          </div>

          {/* Slot select — only shown when an expedition is selected and it has slots */}
          {expeditionFilter && slotsForExpedition.length > 0 && (
            <div className="relative">
              <select
                value={slotFilter ?? ""}
                onChange={(e) => setSlotFilter(e.target.value || null)}
                className="appearance-none pl-3 pr-8 py-2 text-xs border border-border bg-background focus:outline-none focus:border-orange-500/50 transition-colors min-w-[220px] text-muted-foreground"
              >
                <option value="">All slots</option>
                {slotsForExpedition.map(slot => (
                  <option key={slot.id} value={slot.id}>{slotLabel(slot)}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}

          {expeditionFilter && slotsForExpedition.length === 0 && (
            <p className="text-xs text-muted-foreground py-2">No slots for this expedition</p>
          )}

          {hasActiveFilters && (
            <button
              onClick={() => { setStatusFilter(null); setPaymentFilter(null); setSearch(""); setExpeditionFilter(null); setSlotFilter(null) }}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Clear all
            </button>
          )}

          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} booking{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["Booking Ref", "Expedition", "People", "Total", "Status", "Payment", ""].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground whitespace-nowrap">{h}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-4 py-4">
                    <div className="flex gap-4">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                      <div className="ml-auto h-4 w-16 bg-muted animate-pulse rounded" />
                    </div>
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <Mountain className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No bookings found.</p>
                </td>
              </tr>
            ) : (
              filtered.map((booking) => (
                <tr key={booking.id} className="group hover:bg-orange-500/5 transition-colors">
                  {/* Booking ref */}
                  <td className="px-4 py-3 align-middle">
                    <Link href={`/dashboard/bookings/${booking.id}`} className="block">
                      <p className="font-mono text-xs font-black">{booking.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[140px] truncate">{booking.user.name || booking.user.email}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatDate(booking.createdAt)}</p>
                    </Link>
                  </td>

                  {/* Expedition */}
                  <td className="px-4 py-3 align-middle max-w-[220px]">
                    <Link href={`/dashboard/bookings/${booking.id}`} className="block">
                      <p className="text-sm font-semibold leading-snug line-clamp-2">{booking.expedition.title}</p>
                      {booking.slot && (
                        <p className="text-[11px] text-orange-500 mt-0.5 whitespace-nowrap">
                          {booking.slot.label ? `${booking.slot.label} · ` : ""}
                          {formatSlotDate(booking.slot.startDate)} – {formatSlotDate(booking.slot.endDate)}
                        </p>
                      )}
                    </Link>
                  </td>

                  {/* People */}
                  <td className="px-4 py-3 align-middle whitespace-nowrap">
                    <Link href={`/dashboard/bookings/${booking.id}`} className="flex items-center gap-1.5 text-sm">
                      <Users className="h-3 w-3 text-muted-foreground shrink-0" />
                      {booking.numberOfPeople}
                    </Link>
                  </td>

                  {/* Total */}
                  <td className="px-4 py-3 align-middle whitespace-nowrap">
                    <Link href={`/dashboard/bookings/${booking.id}`} className="block text-sm font-black text-orange-500">
                      {formatCurrency(booking.totalAmount)}
                    </Link>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 align-middle">
                    <Link href={`/dashboard/bookings/${booking.id}`} className="block">
                      <span className={`inline-block text-[10px] font-bold px-2.5 py-1 border whitespace-nowrap ${STATUS_STYLES[booking.status] ?? "border-border text-muted-foreground"}`}>
                        {booking.status}
                      </span>
                    </Link>
                  </td>

                  {/* Payment */}
                  <td className="px-4 py-3 align-middle">
                    <Link href={`/dashboard/bookings/${booking.id}`} className="block">
                      <span className={`inline-block text-[10px] font-bold px-2.5 py-1 border whitespace-nowrap ${PAYMENT_STYLES[booking.paymentStatus] ?? "border-border text-muted-foreground"}`}>
                        {booking.paymentStatus}
                      </span>
                    </Link>
                  </td>

                  {/* Arrow */}
                  <td className="px-4 py-3 align-middle">
                    <Link href={`/dashboard/bookings/${booking.id}`} className="flex items-center justify-center">
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

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
