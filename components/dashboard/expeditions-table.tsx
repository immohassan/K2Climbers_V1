"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import toast from "react-hot-toast"

interface Expedition {
  id: string
  title: string
  slug: string
  category: string
  difficulty: string
  altitude: number
  basePrice: number
  isActive: boolean
  featured: boolean
}

export function ExpeditionsTable() {
  const [expeditions, setExpeditions] = useState<Expedition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExpeditions()
  }, [])

  const fetchExpeditions = async () => {
    try {
      const res = await fetch("/api/expeditions")
      const data = await res.json()
      setExpeditions(data)
    } catch (error) {
      console.error("Error fetching expeditions:", error)
      toast.error("Failed to load expeditions")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expedition?")) {
      return
    }

    try {
      const res = await fetch(`/api/expeditions/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Expedition deleted")
        fetchExpeditions()
      } else {
        toast.error("Failed to delete expedition")
      }
    } catch (error) {
      console.error("Error deleting expedition:", error)
      toast.error("Failed to delete expedition")
    }
  }

  if (loading) {
    return <Card><CardContent className="p-6">Loading...</CardContent></Card>
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold">Title</th>
                <th className="text-left p-4 font-semibold">Category</th>
                <th className="text-left p-4 font-semibold">Difficulty</th>
                <th className="text-left p-4 font-semibold">Altitude</th>
                <th className="text-left p-4 font-semibold">Price</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expeditions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No expeditions found. Create your first expedition!
                  </td>
                </tr>
              ) : (
                expeditions.map((expedition) => (
                  <tr key={expedition.id} className="border-b border-border hover:bg-card">
                    <td className="p-4">
                      <div className="font-medium">{expedition.title}</div>
                      <div className="text-sm text-muted-foreground">{expedition.slug}</div>
                    </td>
                    <td className="p-4">{expedition.category}</td>
                    <td className="p-4">{expedition.difficulty}</td>
                    <td className="p-4">{expedition.altitude}m</td>
                    <td className="p-4">{formatCurrency(expedition.basePrice)}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {expedition.isActive && (
                          <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                            Active
                          </span>
                        )}
                        {expedition.featured && (
                          <span className="text-xs px-2 py-1 rounded bg-summit/20 text-summit">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/expeditions/${expedition.slug}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/expeditions/${expedition.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(expedition.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
