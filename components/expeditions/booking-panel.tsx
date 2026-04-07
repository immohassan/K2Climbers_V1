"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import toast from "react-hot-toast"
import Link from "next/link"
import { CalendarDays, Users, ChevronDown, MessageCircle, AlertTriangle, X, Tag, CheckCircle2, XCircle } from "lucide-react"

interface Expedition {
  id: string
  title: string
  basePrice: number
  maxGroupSize: number
  minGroupSize: number
}

interface Slot {
  id: string
  startDate: string
  endDate: string
  label: string | null
  maxParticipants: number
  bookedCount: number
  priceOverride: number | null
}

function formatSlotDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export function BookingPanel({ expedition }: { expedition: Expedition }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [numberOfPeople, setNumberOfPeople] = useState(1)
  const [loading, setLoading] = useState(false)
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [showSlots, setShowSlots] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [couponInput, setCouponInput] = useState("")
  const [couponStatus, setCouponStatus] = useState<"idle" | "loading" | "valid" | "invalid">("idle")
  const [couponData, setCouponData] = useState<{ discountType: "PERCENTAGE" | "FIXED"; discountValue: number; description?: string | null } | null>(null)
  const [couponError, setCouponError] = useState("")
  const couponDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch(`/api/expeditions/${expedition.id}/slots`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: Slot[]) => {
        // only show slots with remaining spots
        setSlots(data.filter((s) => s.maxParticipants - s.bookedCount > 0))
      })
      .catch(() => {})
      .finally(() => setSlotsLoading(false))
  }, [expedition.id])

  const pricePerPerson = selectedSlot?.priceOverride ?? expedition.basePrice
  const subtotal = pricePerPerson * numberOfPeople
  const discountAmount = couponData
    ? couponData.discountType === "PERCENTAGE"
      ? Math.round((subtotal * couponData.discountValue) / 100 * 100) / 100
      : Math.min(couponData.discountValue, subtotal)
    : 0
  const totalAmount = subtotal - discountAmount

  const maxAllowed = selectedSlot
    ? Math.min(expedition.maxGroupSize, selectedSlot.maxParticipants - selectedSlot.bookedCount)
    : expedition.maxGroupSize

  const applyCoupon = async (code: string) => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) { setCouponStatus("idle"); setCouponData(null); setCouponError(""); return }
    setCouponStatus("loading")
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(trimmed)}`)
      const data = await res.json()
      if (data.valid) {
        setCouponStatus("valid")
        setCouponData({ discountType: data.discountType, discountValue: data.discountValue, description: data.description })
        setCouponError("")
      } else {
        setCouponStatus("invalid")
        setCouponData(null)
        setCouponError(data.error || "Invalid coupon")
      }
    } catch {
      setCouponStatus("invalid")
      setCouponData(null)
      setCouponError("Failed to validate coupon")
    }
  }

  const handleCouponChange = (value: string) => {
    setCouponInput(value)
    setCouponStatus("idle")
    setCouponData(null)
    setCouponError("")
    if (couponDebounce.current) clearTimeout(couponDebounce.current)
    if (value.trim()) {
      couponDebounce.current = setTimeout(() => applyCoupon(value), 600)
    }
  }

  const removeCoupon = () => {
    setCouponInput("")
    setCouponStatus("idle")
    setCouponData(null)
    setCouponError("")
  }

  const openConfirm = () => {
    if (!session) { router.push("/auth/signin"); return }
    if (slots.length > 0 && !selectedSlot) { toast.error("Please select an expedition slot"); return }
    setConfirmOpen(true)
  }

  const confirmBooking = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expeditionId: expedition.id,
          slotId: selectedSlot?.id ?? null,
          numberOfPeople,
          couponCode: couponStatus === "valid" ? couponInput.trim().toUpperCase() : null,
        }),
      })

      if (res.ok) {
        const booking = await res.json()
        setConfirmOpen(false)
        toast.success("Booking created successfully!")
        router.push(`/bookings/${booking.id}`)
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to create booking")
      }
    } catch {
      toast.error("Failed to create booking")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-border p-5 sm:p-6 space-y-5">
      <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">Book This Expedition</p>

      {/* Slot picker */}
      <div>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2">Select a Date</p>
        {slotsLoading ? (
          <div className="h-10 bg-muted animate-pulse" />
        ) : slots.length === 0 ? (
          <div className="border border-border px-3 py-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">No upcoming slots available</p>
            <p className="text-[11px] text-muted-foreground">Contact us to arrange dates or make an inquiry.</p>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowSlots(!showSlots)}
              className="w-full flex items-center justify-between border border-border px-3 py-2.5 text-sm hover:border-orange-500/50 transition-colors text-left"
            >
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                {selectedSlot ? (
                  <span>
                    {selectedSlot.label && <span className="text-orange-500 font-semibold mr-1">{selectedSlot.label} · </span>}
                    {formatSlotDate(selectedSlot.startDate)} – {formatSlotDate(selectedSlot.endDate)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Choose a slot…</span>
                )}
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showSlots ? "rotate-180" : ""}`} />
            </button>

            {showSlots && (
              <div className="absolute top-full left-0 right-0 z-20 border border-border bg-background shadow-lg divide-y divide-border max-h-60 overflow-y-auto">
                {slots.map((slot) => {
                  const available = slot.maxParticipants - slot.bookedCount
                  const pct = Math.round((slot.bookedCount / slot.maxParticipants) * 100)
                  return (
                    <button
                      key={slot.id}
                      onClick={() => { setSelectedSlot(slot); setShowSlots(false); setNumberOfPeople(1) }}
                      className={`w-full text-left px-3 py-3 hover:bg-orange-500/5 transition-colors ${selectedSlot?.id === slot.id ? "bg-orange-500/8" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          {slot.label && <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500 mb-0.5">{slot.label}</p>}
                          <p className="text-xs font-semibold">
                            {formatSlotDate(slot.startDate)} – {formatSlotDate(slot.endDate)}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Users className="h-3 w-3" />{available} spot{available !== 1 ? "s" : ""} left
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-black text-orange-500">
                            {slot.priceOverride ? formatCurrency(slot.priceOverride) : formatCurrency(expedition.basePrice)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">per person</p>
                        </div>
                      </div>
                      {/* Fill bar */}
                      <div className="h-0.5 w-full bg-border mt-2">
                        <div
                          className={`h-0.5 ${pct >= 80 ? "bg-red-400" : pct >= 50 ? "bg-yellow-400" : "bg-green-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* People — only shown when slots exist */}
      <div className={!slotsLoading && slots.length === 0 ? "hidden" : ""}>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2">Number of People</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNumberOfPeople((n) => Math.max(1, n - 1))}
            className="w-9 h-9 border border-border flex items-center justify-center font-bold text-base hover:border-orange-500/50 transition-colors"
          >
            −
          </button>
          <span className="w-8 text-center font-black text-lg">{numberOfPeople}</span>
          <button
            onClick={() => setNumberOfPeople((n) => Math.min(maxAllowed, n + 1))}
            className="w-9 h-9 border border-border flex items-center justify-center font-bold text-base hover:border-orange-500/50 transition-colors"
          >
            +
          </button>
          <span className="text-xs text-muted-foreground ml-1">
1–{maxAllowed} people
            {selectedSlot && maxAllowed < expedition.maxGroupSize && (
              <span className="text-orange-500"> (slot limit)</span>
            )}
          </span>
        </div>
      </div>

      {/* Coupon code — only shown when slots exist */}
      <div className={!slotsLoading && slots.length === 0 ? "hidden" : ""}>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2">Coupon Code</p>
        {couponStatus === "valid" && couponData ? (
          <div className="flex items-center justify-between border border-green-500/50 bg-green-500/5 px-3 py-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-green-600">{couponInput.toUpperCase()}</p>
                {couponData.description && <p className="text-[11px] text-muted-foreground">{couponData.description}</p>}
              </div>
            </div>
            <button onClick={removeCoupon} className="text-muted-foreground hover:text-foreground transition-colors ml-2">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={couponInput}
              onChange={(e) => handleCouponChange(e.target.value)}
              placeholder="Enter coupon code"
              className="w-full border border-border pl-8 pr-3 py-2 text-sm bg-background focus:outline-none focus:border-orange-500/50 uppercase placeholder:normal-case placeholder:tracking-normal tracking-widest font-mono"
              maxLength={50}
            />
            {couponStatus === "loading" && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            )}
            {couponStatus === "invalid" && (
              <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
            )}
          </div>
        )}
        {couponStatus === "invalid" && couponError && (
          <p className="text-[11px] text-red-500 mt-1">{couponError}</p>
        )}
      </div>

      {/* Price summary — only shown when slots exist */}
      <div className={`border-t border-border pt-4 space-y-2${!slotsLoading && slots.length === 0 ? " hidden" : ""}`}>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Per person</span>
          <span className="font-semibold">{formatCurrency(pricePerPerson)}</span>
        </div>
        {selectedSlot && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {formatSlotDate(selectedSlot.startDate)} – {formatSlotDate(selectedSlot.endDate)}
            </span>
          </div>
        )}
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Discount
              {couponData?.discountType === "PERCENTAGE" && ` (${couponData.discountValue}%)`}
            </span>
            <span className="font-semibold">−{formatCurrency(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="font-black text-base">Total</span>
          <span className="font-black text-base text-orange-500">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {!slotsLoading && slots.length === 0 ? (
        /* No slots — contact us */
        <Link href="/contact" className="block">
          <Button variant="summit" className="w-full rounded-none flex items-center justify-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Contact Us to Book
          </Button>
        </Link>
      ) : !slotsLoading && slots.length > 0 && !selectedSlot ? (
        /* Slots exist but none selected — disabled */
        <Button variant="summit" className="w-full rounded-none opacity-50 cursor-not-allowed" disabled>
          Select a Date to Book
        </Button>
      ) : session ? (
        /* Slot selected + signed in — active */
        <Button
          variant="summit"
          className="w-full rounded-none"
          onClick={openConfirm}
          disabled={loading}
        >
          Book Now
        </Button>
      ) : (
        /* Slot selected but not signed in */
        <Link href="/auth/signin" className="block">
          <Button variant="summit" className="w-full rounded-none">
            Sign In to Book
          </Button>
        </Link>
      )}
      {/* ── Confirmation Modal ── */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmOpen(false) }}
        >
          <div className="w-full max-w-md bg-background border border-border shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-500">Confirm Booking</p>
                <h2 className="text-lg font-black leading-tight mt-0.5">{expedition.title}</h2>
              </div>
              <button
                onClick={() => setConfirmOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors ml-4 shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Summary */}
            <div className="px-5 py-4 space-y-2.5 border-b border-border">
              {selectedSlot && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Dates</span>
                  <span className="font-semibold text-right">
                    {selectedSlot.label && <span className="text-orange-500 mr-1">{selectedSlot.label} · </span>}
                    {formatSlotDate(selectedSlot.startDate)} – {formatSlotDate(selectedSlot.endDate)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Participants</span>
                <span className="font-semibold">{numberOfPeople} {numberOfPeople === 1 ? "person" : "people"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per person</span>
                <span className="font-semibold">{formatCurrency(pricePerPerson)}</span>
              </div>
              {discountAmount > 0 && couponData && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    Coupon ({couponInput.toUpperCase()})
                    {couponData.discountType === "PERCENTAGE" && ` −${couponData.discountValue}%`}
                  </span>
                  <span className="font-semibold">−{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black border-t border-border pt-2.5 mt-1">
                <span>Total</span>
                <span className="text-orange-500">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Certificate notice — shown when >1 person */}
            {numberOfPeople > 1 && (
              <div className="px-5 py-4 border-b border-border bg-orange-500/5">
                <div className="flex gap-3">
                  <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Certificate notice:</span> When booking for multiple people, the summit certificate will only be issued to <span className="font-semibold text-foreground">your profile</span> upon a successful summit. We recommend that every climber creates their own account so each person receives their individual certificate.
                  </p>
                </div>
              </div>
            )}

            {/* Note */}
            <div className="px-5 py-3 border-b border-border">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your booking will be marked as <span className="font-semibold text-foreground">Pending</span> until our team reviews and confirms it. We will contact you within 24 hours.
              </p>
            </div>

            {/* Actions */}
            <div className="px-5 py-4 flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 border border-border py-2.5 text-sm font-semibold hover:border-orange-500/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white py-2.5 text-sm font-semibold transition-colors"
              >
                {loading ? "Processing…" : "Confirm Booking"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
