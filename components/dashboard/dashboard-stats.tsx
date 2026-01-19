"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mountain, DollarSign, Users, TrendingUp, ShoppingBag, Award } from "lucide-react"

interface Stats {
  expeditions: number
  bookings: number
  revenue: number
  climbers: number
  summits: number
  successRate: number
  products: number
  rentals: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching stats:", error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div>Loading stats...</div>
  }

  if (!stats) {
    return <div>Failed to load stats</div>
  }

  const statCards = [
    {
      title: "Total Expeditions",
      value: stats.expeditions,
      icon: Mountain,
      color: "text-glacier-400",
    },
    {
      title: "Total Bookings",
      value: stats.bookings,
      icon: TrendingUp,
      color: "text-summit",
    },
    {
      title: "Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      title: "Active Climbers",
      value: stats.climbers,
      icon: Users,
      color: "text-glacier-300",
    },
    {
      title: "Success Rate",
      value: `${stats.successRate}%`,
      icon: Award,
      color: "text-summit-600",
    },
    {
      title: "Products",
      value: stats.products,
      icon: ShoppingBag,
      color: "text-glacier-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
