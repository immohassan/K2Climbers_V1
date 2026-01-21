"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface Expedition {
  id: string
  title: string
  slug: string
  _count: {
    bookings: number
    summitRecords: number
  }
}

export function TopExpeditions() {
  const [expeditions, setExpeditions] = useState<Expedition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/expeditions")
      .then((res) => res.json())
      .then((data) => {
        // Sort by bookings count
        const sorted = data
          .sort((a: Expedition, b: Expedition) => 
            b._count.bookings - a._count.bookings
          )
          .slice(0, 5)
        setExpeditions(sorted)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching expeditions:", error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <Card><CardContent className="p-6">Loading...</CardContent></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Expeditions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expeditions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No expeditions yet</p>
          ) : (
            expeditions.map((expedition) => (
              <Link
                key={expedition.id}
                href={`/dashboard/expeditions/${expedition.id}`}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4 last:border-0 last:pb-0 hover:text-summit transition"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm sm:text-base">{expedition.title}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {expedition._count.summitRecords} summit attempts
                  </p>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right gap-2">
                  <p className="font-semibold text-sm sm:text-base">{expedition._count.bookings}</p>
                  <p className="text-xs text-muted-foreground">bookings</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
