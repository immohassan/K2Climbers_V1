"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowLeft, Mountain, Clock, MapPin, Users, Trash2, Save, CalendarDays } from "lucide-react"
import toast from "react-hot-toast"

interface Slot {
  id: string
  startDate: string
  endDate: string
  label: string | null
  maxParticipants: number
  bookedCount: number
}

interface Booking {
  id: string
  numberOfPeople: number
  totalAmount: number
  status: string
  paymentStatus: string
  specialRequests: string | null
  createdAt: string
  updatedAt: string
  slot: Slot | null
  expedition: {
    id: string
    title: string
    slug: string
    heroImage: string | null
    basePrice: number
    altitude: number
    duration: number
    location: string
    difficulty: string
  }
  user: { id: string; name: string | null; email: string }
}

function formatSlotDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

const STATUS_OPTS = ["PENDING", "CONFIRMED", "CANCELLED"]
const PAYMENT_OPTS = ["PENDING", "PAID", "REFUNDED"]

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

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [status, setStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [numberOfPeople, setNumberOfPeople] = useState(1)

  const fetchBooking = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/${id}`)
      if (res.ok) {
        const data: Booking = await res.json()
        setBooking(data)
        setStatus(data.status)
        setPaymentStatus(data.paymentStatus)
        setSpecialRequests(data.specialRequests || "")
        setNumberOfPeople(data.numberOfPeople)
      } else {
        toast.error("Booking not found")
        router.push("/dashboard/bookings")
      }
    } catch {
      toast.error("Failed to load booking")
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    if (id) fetchBooking()
  }, [id, fetchBooking])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus, specialRequests, numberOfPeople }),
      })
      if (res.ok) {
        const updated: Booking = await res.json()
        setBooking(updated)
        toast.success("Booking updated")
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to update booking")
      }
    } catch {
      toast.error("Failed to update booking")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 4000)
      return
    }
    setDeleting(true)
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Booking deleted")
        router.push("/dashboard/bookings")
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to delete booking")
      }
    } catch {
      toast.error("Failed to delete booking")
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="h-6 w-32 bg-muted animate-pulse" />
        <div className="h-48 bg-muted animate-pulse" />
        <div className="h-64 bg-muted animate-pulse" />
      </div>
    )
  }

  if (!booking) return null

  const computedTotal = booking.expedition.basePrice * numberOfPeople

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back + header */}
      <div>
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Bookings
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-500 mb-1">Admin</p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Booking #{booking.id.slice(0, 8).toUpperCase()}</h1>
            <p className="text-sm text-muted-foreground mt-1">Created {formatDate(booking.createdAt)}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white px-4 py-2 text-xs font-bold transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border transition-colors ${
                confirmDelete
                  ? "bg-red-500 border-red-500 text-white"
                  : "border-border text-muted-foreground hover:border-red-500 hover:text-red-500"
              }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? "Deleting…" : confirmDelete ? "Confirm Delete" : "Delete"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: edit form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Status + Payment */}
          <div className="border border-border">
            <div className="px-5 py-3 border-b border-border">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Booking Status</p>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-5">
              <div>
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`text-xs font-bold px-3 py-1.5 border transition-colors ${
                        status === s ? STATUS_STYLES[s] : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2">Payment</p>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_OPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPaymentStatus(p)}
                      className={`text-xs font-bold px-3 py-1.5 border transition-colors ${
                        paymentStatus === p ? PAYMENT_STYLES[p] : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p.charAt(0) + p.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* People + Amount */}
          <div className="border border-border">
            <div className="px-5 py-3 border-b border-border">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Group Size & Amount</p>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-5">
              <div>
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2">Number of People</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNumberOfPeople((n) => Math.max(1, n - 1))}
                    className="w-8 h-8 border border-border flex items-center justify-center text-sm font-bold hover:border-orange-500/50 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-black text-lg">{numberOfPeople}</span>
                  <button
                    onClick={() => setNumberOfPeople((n) => n + 1)}
                    className="w-8 h-8 border border-border flex items-center justify-center text-sm font-bold hover:border-orange-500/50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2">Total Amount</p>
                <p className="text-2xl font-black text-orange-500">{formatCurrency(computedTotal)}</p>
                {computedTotal !== booking.totalAmount && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Was {formatCurrency(booking.totalAmount)} — will update on save
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div className="border border-border">
            <div className="px-5 py-3 border-b border-border">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Special Requests</p>
            </div>
            <div className="p-5">
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requirements or notes…"
                rows={4}
                className="w-full text-sm bg-background border border-border px-3 py-2 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right: info sidebar */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="border border-border">
            <div className="px-5 py-3 border-b border-border">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Customer</p>
            </div>
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-orange-500">
                    {(booking.user.name || booking.user.email)[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">{booking.user.name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{booking.user.email}</p>
                </div>
              </div>
              <Link
                href={`/dashboard/users/${booking.user.id}`}
                className="text-xs text-orange-500 hover:text-orange-400 transition-colors"
              >
                View user profile →
              </Link>
            </div>
          </div>

          {/* Expedition */}
          <div className="border border-border">
            <div className="px-5 py-3 border-b border-border">
              <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Expedition</p>
            </div>
            {booking.expedition.heroImage && (
              <div
                className="h-24 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${booking.expedition.heroImage})` }}
              >
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute bottom-2 left-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase bg-black/40 text-white/80 px-2 py-0.5">
                    {booking.expedition.difficulty}
                  </span>
                </div>
              </div>
            )}
            <div className="p-5 space-y-3">
              <p className="text-sm font-black leading-snug">{booking.expedition.title}</p>
              <div className="space-y-1.5 text-[11px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1.5">
                  <Mountain className="h-3 w-3" />{booking.expedition.altitude.toLocaleString()}m
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />{booking.expedition.duration} days
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />{booking.expedition.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3 w-3" />Base price {formatCurrency(booking.expedition.basePrice)} / person
                </span>
              </div>
              <Link
                href={`/dashboard/expeditions/${booking.expedition.id}`}
                className="text-xs text-orange-500 hover:text-orange-400 transition-colors"
              >
                Edit expedition →
              </Link>
            </div>
          </div>

          {/* Slot */}
          {booking.slot && (
            <div className="border border-border">
              <div className="px-5 py-3 border-b border-border">
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Slot</p>
              </div>
              <div className="px-5 py-4 space-y-1">
                {booking.slot.label && (
                  <p className="text-[10px] font-bold tracking-widest uppercase text-orange-500">{booking.slot.label}</p>
                )}
                <p className="text-sm font-black flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                  {formatSlotDate(booking.slot.startDate)} – {formatSlotDate(booking.slot.endDate)}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  {booking.slot.bookedCount}/{booking.slot.maxParticipants} participants booked
                </p>
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="border border-border divide-y divide-border">
            {[
              { label: "Booking Ref", value: booking.id.slice(0, 8).toUpperCase() },
              { label: "Created", value: formatDate(booking.createdAt) },
              { label: "Last Updated", value: formatDate(booking.updatedAt) },
            ].map(({ label, value }) => (
              <div key={label} className="px-5 py-3 flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">{label}</span>
                <span className="text-xs font-semibold font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
