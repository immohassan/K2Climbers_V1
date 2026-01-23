"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Book This Expedition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="people">Number of People</Label>
          <Input
            id="people"
            type="number"
            min={expedition.minGroupSize}
            max={expedition.maxGroupSize}
            value={numberOfPeople}
            onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
          />
          <p className="text-xs text-muted-foreground">
            Group size: {expedition.minGroupSize} - {expedition.maxGroupSize} people
          </p>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex justify-between mb-2">
            <span>Price per person</span>
            <span className="font-semibold">{formatCurrency(expedition.basePrice)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {session ? (
          <Button
            variant="summit"
            className="w-full"
            onClick={handleBooking}
            disabled={loading}
          >
            {loading ? "Processing..." : "Book Now"}
          </Button>
        ) : (
          <Link href="/auth/signin" className="block">
            <Button variant="summit" className="w-full">
              Sign In to Book
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
