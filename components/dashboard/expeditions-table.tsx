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
                <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Title</th>
                <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Category</th>
                <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Difficulty</th>
                <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Altitude</th>
                <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Price</th>
                <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Status</th>
                <th className="text-right p-3 md:p-4 font-semibold text-xs md:text-sm">Actions</th>
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
                    <td className="p-3 md:p-4">
                      <div className="font-medium text-xs md:text-sm">{expedition.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px] md:max-w-none">{expedition.slug}</div>
                    </td>
                    <td className="p-3 md:p-4 text-xs md:text-sm">{expedition.category}</td>
                    <td className="p-3 md:p-4 text-xs md:text-sm">{expedition.difficulty}</td>
                    <td className="p-3 md:p-4 text-xs md:text-sm">{expedition.altitude}m</td>
                    <td className="p-3 md:p-4 text-xs md:text-sm">{formatCurrency(expedition.basePrice)}</td>
                    <td className="p-3 md:p-4">
                      <div className="flex flex-wrap gap-1 md:gap-2">
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
                    <td className="p-3 md:p-4">
                      <div className="flex items-center justify-end gap-1 md:gap-2">
                        <Link href={`/expeditions/${expedition.slug}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                            <Eye className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/expeditions/${expedition.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 md:h-10 md:w-10"
                          onClick={() => handleDelete(expedition.id)}
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
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
