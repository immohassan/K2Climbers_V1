"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import toast from "react-hot-toast"
import Link from "next/link"

interface Expedition {
  id: string
  title: string
  basePrice: number
  maxGroupSize: number
  minGroupSize: number
}

export function BookingPanel({ expedition }: { expedition: Expedition }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [numberOfPeople, setNumberOfPeople] = useState(1)
  const [loading, setLoading] = useState(false)

  const totalAmount = expedition.basePrice * numberOfPeople

  const handleBooking = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expeditionId: expedition.id,
          numberOfPeople,
        }),
      })

      if (res.ok) {
        toast.success("Booking created successfully!")
        router.push("/dashboard")
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to create booking")
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      toast.error("Failed to create booking")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-border p-5 sm:p-6">
      <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-5">Book This Expedition</p>

      <div className="space-y-2 mb-5">
        <Label htmlFor="people" className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Number of People</Label>
        <Input
          id="people"
          type="number"
          min={expedition.minGroupSize}
          max={expedition.maxGroupSize}
          value={numberOfPeople}
          onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
          className="rounded-none"
        />
        <p className="text-xs text-muted-foreground">
          Group size: {expedition.minGroupSize}–{expedition.maxGroupSize} people
        </p>
      </div>

      <div className="border-t border-border pt-4 mb-5 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Per person</span>
          <span className="font-semibold">{formatCurrency(expedition.basePrice)}</span>
        </div>
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
