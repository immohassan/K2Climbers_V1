"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, Pencil, X, Check, Users, CalendarDays } from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency } from "@/lib/utils"

interface Slot {
  id: string
  startDate: string
  endDate: string
  label: string | null
  maxParticipants: number
  bookedCount: number
  priceOverride: number | null
  isActive: boolean
}

function formatSlotDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

const EMPTY_FORM = { startDate: "", endDate: "", label: "", maxParticipants: "", priceOverride: "" }

export function ExpeditionSlotsManager({
  expeditionId,
  basePrice,
}: {
  expeditionId: string
  basePrice: number
}) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch(`/api/expeditions/${expeditionId}/slots`)
      if (res.ok) setSlots(await res.json())
    } catch {
      toast.error("Failed to load slots")
    } finally {
      setLoading(false)
    }
  }, [expeditionId])

  useEffect(() => { fetchSlots() }, [fetchSlots])

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (slot: Slot) => {
    setEditingId(slot.id)
    setForm({
      startDate: slot.startDate.slice(0, 10),
      endDate: slot.endDate.slice(0, 10),
      label: slot.label || "",
      maxParticipants: String(slot.maxParticipants),
      priceOverride: slot.priceOverride ? String(slot.priceOverride) : "",
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.startDate || !form.endDate || !form.maxParticipants) {
      toast.error("Start date, end date, and max participants are required")
      return
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      toast.error("End date must be after start date")
      return
    }

    setSaving(true)
    try {
      const payload = {
        startDate: form.startDate,
        endDate: form.endDate,
        label: form.label || null,
        maxParticipants: parseInt(form.maxParticipants),
        priceOverride: form.priceOverride ? parseFloat(form.priceOverride) : null,
      }

      let res: Response
      if (editingId) {
        res = await fetch(`/api/expeditions/${expeditionId}/slots/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`/api/expeditions/${expeditionId}/slots`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        toast.success(editingId ? "Slot updated" : "Slot created")
        setShowForm(false)
        setEditingId(null)
        fetchSlots()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to save slot")
      }
    } catch {
      toast.error("Failed to save slot")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      setTimeout(() => setConfirmDeleteId(null), 4000)
      return
    }
    setDeletingId(id)
    try {
      const res = await fetch(`/api/expeditions/${expeditionId}/slots/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Slot deleted")
        setSlots((prev) => prev.filter((s) => s.id !== id))
      } else {
        toast.error("Failed to delete slot")
      }
    } catch {
      toast.error("Failed to delete slot")
    } finally {
      setDeletingId(false as any)
      setConfirmDeleteId(null)
    }
  }

  const toggleActive = async (slot: Slot) => {
    try {
      const res = await fetch(`/api/expeditions/${expeditionId}/slots/${slot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !slot.isActive }),
      })
      if (res.ok) {
        setSlots((prev) => prev.map((s) => s.id === slot.id ? { ...s, isActive: !s.isActive } : s))
      }
    } catch {
      toast.error("Failed to update slot")
    }
  }

  return (
    <div className="border border-border">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-500">Slots</p>
          <p className="text-sm font-black mt-0.5">Expedition Dates</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-3 py-2 text-xs font-bold transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add Slot
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="border-b border-border px-5 py-5 bg-orange-500/5 space-y-4">
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-orange-500">
            {editingId ? "Edit Slot" : "New Slot"}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5">Start Date *</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full text-sm bg-background border border-border px-3 py-2 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5">End Date *</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full text-sm bg-background border border-border px-3 py-2 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5">Label (optional)</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. Spring Season"
                className="w-full text-sm bg-background border border-border px-3 py-2 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5">Max Participants *</label>
              <input
                type="number"
                min="1"
                value={form.maxParticipants}
                onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                placeholder="e.g. 12"
                className="w-full text-sm bg-background border border-border px-3 py-2 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5">
                Price Override (optional — leave blank to use base price of {formatCurrency(basePrice)})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.priceOverride}
                onChange={(e) => setForm({ ...form, priceOverride: e.target.value })}
                placeholder={`Default: ${formatCurrency(basePrice)}`}
                className="w-full text-sm bg-background border border-border px-3 py-2 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowForm(false); setEditingId(null) }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-border hover:bg-muted/50 transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white transition-colors"
            >
              <Check className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save Slot"}
            </button>
          </div>
        </div>
      )}

      {/* Slots list */}
      {loading ? (
        <div className="divide-y divide-border">
          {[1, 2].map((i) => (
            <div key={i} className="px-5 py-4 flex gap-4">
              <div className="h-4 w-32 bg-muted animate-pulse" />
              <div className="h-4 w-24 bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <CalendarDays className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No slots yet. Add your first expedition date.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {slots.map((slot) => {
            const available = slot.maxParticipants - slot.bookedCount
            const pct = Math.round((slot.bookedCount / slot.maxParticipants) * 100)
            return (
              <div key={slot.id} className={`px-5 py-4 ${!slot.isActive ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    {slot.label && (
                      <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-orange-500">{slot.label}</p>
                    )}
                    <p className="text-sm font-black">
                      {formatSlotDate(slot.startDate)} — {formatSlotDate(slot.endDate)}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {slot.bookedCount}/{slot.maxParticipants} booked · {available} left
                      </span>
                      <span>{slot.priceOverride ? formatCurrency(slot.priceOverride) : `${formatCurrency(basePrice)} (base)`}</span>
                    </div>
                    {/* Fill bar */}
                    <div className="h-1 w-40 bg-border mt-1.5">
                      <div
                        className={`h-1 transition-all ${pct >= 100 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-green-500"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleActive(slot)}
                      title={slot.isActive ? "Deactivate" : "Activate"}
                      className={`text-[10px] font-bold px-2 py-1 border transition-colors ${
                        slot.isActive
                          ? "border-green-500/30 bg-green-500/10 text-green-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
                          : "border-border text-muted-foreground hover:border-green-500/30 hover:text-green-500"
                      }`}
                    >
                      {slot.isActive ? "Active" : "Inactive"}
                    </button>
                    <button
                      onClick={() => openEdit(slot)}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(slot.id)}
                      disabled={deletingId === slot.id}
                      className={`p-1.5 transition-colors border ${
                        confirmDeleteId === slot.id
                          ? "text-red-500 border-red-500/30 bg-red-500/10"
                          : "text-muted-foreground border-transparent hover:text-red-500 hover:border-red-500/30"
                      }`}
                      title={confirmDeleteId === slot.id ? "Click again to confirm" : "Delete slot"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer */}
      {slots.length > 0 && (
        <div className="px-5 py-3 border-t border-border bg-card/50">
          <span className="text-[11px] text-muted-foreground">{slots.length} slot{slots.length !== 1 ? "s" : ""}</span>
        </div>
      )}
    </div>
  )
}
