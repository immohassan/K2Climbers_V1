"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import toast from "react-hot-toast"
import Link from "next/link"
import { CalendarDays, Users, ChevronDown } from "lucide-react"

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
  const totalAmount = pricePerPerson * numberOfPeople

  const maxAllowed = selectedSlot
    ? Math.min(expedition.maxGroupSize, selectedSlot.maxParticipants - selectedSlot.bookedCount)
    : expedition.maxGroupSize

  const handleBooking = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (slots.length > 0 && !selectedSlot) {
      toast.error("Please select an expedition slot")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expeditionId: expedition.id,
          slotId: selectedSlot?.id ?? null,
          numberOfPeople,
        }),
      })

      if (res.ok) {
        const booking = await res.json()
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
          <p className="text-xs text-muted-foreground border border-border px-3 py-2.5">No upcoming slots — contact us for dates</p>
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

      {/* People */}
      <div>
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

      {/* Price summary */}
      <div className="border-t border-border pt-4 space-y-2">
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
        <div className="flex justify-between">
          <span className="font-black text-base">Total</span>
          <span className="font-black text-base text-orange-500">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {session ? (
        <Button
          variant="summit"
          className="w-full rounded-none"
          onClick={handleBooking}
          disabled={loading}
        >
          {loading ? "Processing..." : "Book Now"}
        </Button>
      ) : (
        <Link href="/auth/signin" className="block">
          <Button variant="summit" className="w-full rounded-none">
            Sign In to Book
          </Button>
        </Link>
      )}
    </div>
  )
}
