"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye, Plus, Mountain } from "lucide-react"
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

const DIFF_COLOR: Record<string, string> = {
  BEGINNER:     "text-green-500 bg-green-500/10",
  INTERMEDIATE: "text-blue-500 bg-blue-500/10",
  ADVANCED:     "text-orange-500 bg-orange-500/10",
  EXPERT:       "text-red-500 bg-red-500/10",
  EXTREME:      "text-purple-500 bg-purple-500/10",
}

export function ExpeditionsTable() {
  const [expeditions, setExpeditions] = useState<Expedition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchExpeditions() }, [])

  const fetchExpeditions = async () => {
    try {
      const res = await fetch("/api/expeditions")
      setExpeditions(await res.json())
    } catch {
      toast.error("Failed to load expeditions")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expedition?")) return
    try {
      const res = await fetch(`/api/expeditions/${id}`, { method: "DELETE" })
      if (res.ok) { toast.success("Expedition deleted"); fetchExpeditions() }
      else toast.error("Failed to delete expedition")
    } catch { toast.error("Failed to delete expedition") }
  }

  if (loading) {
    return (
      <div className="border border-border divide-y divide-border">
        <div className="px-5 py-4 border-b border-border h-14 animate-pulse bg-muted/20" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex gap-4 animate-pulse">
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-muted rounded w-48" />
              <div className="h-2.5 bg-muted/60 rounded w-28" />
            </div>
            <div className="h-3.5 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="border border-border">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 bg-muted/30">
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Expedition</p>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground hidden md:block w-24">Difficulty</p>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground hidden sm:block w-16 text-right">Altitude</p>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground w-24 text-right hidden sm:block">Price</p>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground w-16 text-center hidden md:block">Status</p>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground w-20 text-right">Actions</p>
      </div>

      {expeditions.length === 0 ? (
        <div className="px-5 py-16 flex flex-col items-center gap-4 text-center">
          <Mountain className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No expeditions yet.</p>
          <Link
            href="/dashboard/expeditions/new"
            className="flex items-center gap-2 text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 transition-colors"
          >
            <Plus className="h-4 w-4" /> Create First Expedition
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {expeditions.map((exp) => (
            <div
              key={exp.id}
              className="px-5 py-4 grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 hover:bg-muted/20 transition-colors group"
            >
              {/* Title */}
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate group-hover:text-orange-500 transition-colors">{exp.title}</p>
                <p className="text-[10px] text-muted-foreground font-mono truncate">
                  {exp.category.replace("_", " ")} &middot; {exp.slug}
                </p>
              </div>

              {/* Difficulty */}
              <span className={`hidden md:inline-block text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 w-24 text-center ${DIFF_COLOR[exp.difficulty] ?? "bg-muted text-muted-foreground"}`}>
                {exp.difficulty}
              </span>

              {/* Altitude */}
              <span className="hidden sm:block text-sm font-mono text-right w-16">{exp.altitude.toLocaleString()}m</span>

              {/* Price */}
              <span className="hidden sm:block text-sm font-semibold text-right w-24">{formatCurrency(exp.basePrice)}</span>

              {/* Status */}
              <div className="hidden md:flex items-center justify-center gap-1 w-16">
                {exp.isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Active" />
                )}
                {exp.featured && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" title="Featured" />
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-0.5 w-20">
                <Link href={`/expeditions/${exp.slug}`} title="View">
                  <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </Link>
                <Link href={`/dashboard/expeditions/${exp.id}`} title="Edit">
                  <button className="p-1.5 text-muted-foreground hover:text-orange-500 transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="px-5 py-3 border-t border-border bg-muted/10 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{expeditions.length} expedition{expeditions.length !== 1 ? "s" : ""}</p>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Featured</span>
        </div>
      </div>
    </div>
  )
}
