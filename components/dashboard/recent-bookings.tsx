"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatCurrency } from "@/lib/utils"

interface Booking {
  id: string
  numberOfPeople: number
  totalAmount: number
  status: string
  createdAt: string
  expedition: {
    title: string
  }
  user: {
    name: string
    email: string
  }
}

export function RecentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        setBookings(data.slice(0, 5))
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching bookings:", error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <Card><CardContent className="p-6">Loading...</CardContent></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <p className="text-muted-foreground text-sm">No bookings yet</p>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm sm:text-base">{booking.expedition.title}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {booking.user.name} • {booking.numberOfPeople} people
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(booking.createdAt)}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right gap-2">
                  <p className="font-semibold text-sm sm:text-base">{formatCurrency(booking.totalAmount)}</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    booking.status === "CONFIRMED" 
                      ? "bg-green-500/20 text-green-400"
                      : booking.status === "PENDING"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
