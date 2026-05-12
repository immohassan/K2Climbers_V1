"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Tag, Plus, Edit, Trash2, X, Search, CheckCircle2,
  XCircle, Users, ChevronDown, Percent, DollarSign,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import toast from "react-hot-toast"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Coupon {
  id: string
  code: string
  description: string | null
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
  allowedUserIds: string[]
  createdAt: string
  _count: { usages: number; bookings: number }
}

interface UserOption {
  id: string
  name: string | null
  email: string
}

const EMPTY_FORM = {
  code: "",
  description: "",
  discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
  discountValue: "",
  maxUses: "",
  expiresAt: "",
  isActive: true,
  allowedUserIds: [] as string[],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function DiscountBadge({ type, value }: { type: "PERCENTAGE" | "FIXED"; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold font-mono">
      {type === "PERCENTAGE" ? (
        <><Percent className="h-3 w-3 text-orange-500" />{value}% off</>
      ) : (
        <><DollarSign className="h-3 w-3 text-blue-500" />${value} off</>
      )}
    </span>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-green-500/10 text-green-600 px-1.5 py-0.5">
      <CheckCircle2 className="h-3 w-3" />Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-muted text-muted-foreground px-1.5 py-0.5">
      <XCircle className="h-3 w-3" />Inactive
    </span>
  )
}

// ─── User Picker ──────────────────────────────────────────────────────────────

function UserPicker({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const [allUsers, setAllUsers] = useState<UserOption[]>([])
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.ok ? r.json() : [])
      .then((data: UserOption[]) => setAllUsers(data))
      .catch(() => {})
  }, [])

  const selectedUsers = allUsers.filter((u) => selected.includes(u.id))
  const filtered = search
    ? allUsers.filter(
        (u) =>
          !selected.includes(u.id) &&
          ((u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()))
      )
    : allUsers.filter((u) => !selected.includes(u.id))

  const add = (id: string) => { onChange([...selected, id]); setSearch(""); setOpen(false) }
  const remove = (id: string) => onChange(selected.filter((i) => i !== id))

  return (
    <div className="space-y-2">
      {/* Selected users */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedUsers.map((u) => (
            <span
              key={u.id}
              className="inline-flex items-center gap-1.5 text-xs bg-orange-500/10 text-orange-600 px-2 py-1"
            >
              {u.name || u.email}
              <button
                type="button"
                onClick={() => remove(u.id)}
                className="hover:text-orange-800 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search + dropdown */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder="Search climbers to restrict…"
            className="w-full pl-8 pr-8 py-2 text-sm border border-border bg-background focus:outline-none focus:border-orange-500/50"
          />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {open && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-30 border border-border bg-background shadow-lg max-h-44 overflow-y-auto divide-y divide-border">
            {filtered.slice(0, 20).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => add(u.id)}
                className="w-full text-left px-3 py-2 hover:bg-orange-500/5 transition-colors"
              >
                <p className="text-xs font-semibold">{u.name || "No name"}</p>
                <p className="text-[11px] text-muted-foreground">{u.email}</p>
              </button>
            ))}
          </div>
        )}
        {open && (
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        {selected.length === 0
          ? "Leave empty to allow any climber to use this coupon."
          : `Restricted to ${selected.length} climber${selected.length !== 1 ? "s" : ""}.`}
      </p>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function CouponModal({
  coupon,
  onClose,
  onSaved,
}: {
  coupon: Coupon | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!coupon
  const [form, setForm] = useState(() =>
    coupon
      ? {
          code: coupon.code,
          description: coupon.description ?? "",
          discountType: coupon.discountType,
          discountValue: String(coupon.discountValue),
          maxUses: coupon.maxUses !== null ? String(coupon.maxUses) : "",
          expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : "",
          isActive: coupon.isActive,
          allowedUserIds: coupon.allowedUserIds,
        }
      : { ...EMPTY_FORM }
  )
  const [saving, setSaving] = useState(false)

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || null,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        isActive: form.isActive,
        allowedUserIds: form.allowedUserIds,
      }

      const url = isEdit ? `/api/admin/coupons/${coupon!.id}` : "/api/admin/coupons"
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(isEdit ? "Coupon updated" : "Coupon created")
        onSaved()
        onClose()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to save coupon")
      }
    } catch {
      toast.error("Failed to save coupon")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg bg-background border border-border shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-background">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-500">
              {isEdit ? "Edit Coupon" : "New Coupon"}
            </p>
            <h2 className="text-lg font-black leading-tight mt-0.5">
              {isEdit ? coupon!.code : "Create Discount Code"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors ml-4 shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5">
          {/* Code */}
          <div>
            <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="e.g. SUMMIT25"
              className="w-full border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:border-orange-500/50 uppercase font-mono tracking-widest"
              maxLength={50}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional note shown to climber"
              className="w-full border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:border-orange-500/50"
              maxLength={500}
            />
          </div>

          {/* Discount type + value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5">
                Discount Type <span className="text-red-500">*</span>
              </label>
              <div className="flex border border-border">
                {(["PERCENTAGE", "FIXED"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("discountType", t)}
                    className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                      form.discountType === t
                        ? "bg-orange-500 text-white"
                        : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {t === "PERCENTAGE" ? "%" : "$"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5">
                Value <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {form.discountType === "PERCENTAGE" ? "%" : "$"}
                </span>
                <input
                  required
                  type="number"
                  min={0.01}
                  max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                  step={0.01}
                  value={form.discountValue}
                  onChange={(e) => set("discountValue", e.target.value)}
                  className="w-full border border-border pl-7 pr-3 py-2 text-sm bg-background focus:outline-none focus:border-orange-500/50"
                />
              </div>
            </div>
          </div>

          {/* Max uses + expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5">
                Max Uses
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={form.maxUses}
                onChange={(e) => set("maxUses", e.target.value)}
                placeholder="Unlimited"
                className="w-full border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1.5">
                Expires At
              </label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => set("expiresAt", e.target.value)}
                className="w-full border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:border-orange-500/50"
              />
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <p className="text-sm font-semibold">Active</p>
              <p className="text-[11px] text-muted-foreground">Inactive coupons cannot be redeemed</p>
            </div>
            <button
              type="button"
              onClick={() => set("isActive", !form.isActive)}
              className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
                form.isActive ? "bg-orange-500" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  form.isActive ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Allowed users */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Restrict to Specific Climbers</p>
            </div>
            <UserPicker
              selected={form.allowedUserIds}
              onChange={(ids) => set("allowedUserIds", ids)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border py-2.5 text-sm font-semibold hover:border-orange-500/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white py-2.5 text-sm font-semibold transition-colors"
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Table ───────────────────────────────────────────────────────────────

export function CouponsTable() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/coupons")
      if (res.ok) setCoupons(await res.json())
      else toast.error("Failed to load coupons")
    } catch {
      toast.error("Failed to load coupons")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCoupons() }, [fetchCoupons])

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (c: Coupon) => { setEditing(c); setModalOpen(true) }

  const deleteCoupon = async (c: Coupon) => {
    if (!confirm(`Delete coupon "${c.code}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, { method: "DELETE" })
      if (res.ok) { toast.success("Coupon deleted"); fetchCoupons() }
      else { const e = await res.json(); toast.error(e.error || "Failed to delete") }
    } catch {
      toast.error("Failed to delete coupon")
    }
  }

  const filtered = search
    ? coupons.filter(
        (c) =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          (c.description ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : coupons

  if (loading) {
    return (
      <div className="border border-border divide-y divide-border">
        <div className="px-5 py-4 h-12 animate-pulse bg-muted/20" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-24 shrink-0" />
            <div className="flex-1 h-3 bg-muted/60 rounded w-32" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code or description…"
              className="w-full pl-9 pr-8 py-2 text-sm border border-border bg-background focus:outline-none focus:border-orange-500/50 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 text-sm font-semibold transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Coupon
          </button>
        </div>

        {/* Table */}
        <div className="border border-border">
          {/* Header */}
          <div className="px-5 py-3 border-b border-border grid grid-cols-[2fr_1fr_1fr_auto_auto_auto] items-center gap-4 bg-muted/30">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Code</p>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Discount</p>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground hidden sm:block">Uses</p>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground hidden md:block w-20">Expires</p>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground w-16 text-center">Status</p>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground w-16 text-right">Actions</p>
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-16 flex flex-col items-center gap-3">
              <Tag className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {search ? "No coupons match your search." : "No coupons yet. Create your first one."}
              </p>
              {!search && (
                <button
                  onClick={openCreate}
                  className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-400 font-semibold transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Coupon
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((c) => {
                const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date()
                const isExhausted = c.maxUses !== null && c.usedCount >= c.maxUses
                return (
                  <div
                    key={c.id}
                    className="px-5 py-3.5 grid grid-cols-[2fr_1fr_1fr_auto_auto_auto] items-center gap-4 hover:bg-muted/20 transition-colors group"
                  >
                    {/* Code + description */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black font-mono tracking-wider group-hover:text-orange-500 transition-colors">
                          {c.code}
                        </p>
                        {c.allowedUserIds.length > 0 && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-500 bg-blue-500/10 px-1.5 py-0.5"
                            title={`Restricted to ${c.allowedUserIds.length} climber${c.allowedUserIds.length !== 1 ? "s" : ""}`}
                          >
                            <Users className="h-2.5 w-2.5" />
                            {c.allowedUserIds.length}
                          </span>
                        )}
                        {(isExpired || isExhausted) && (
                          <span className="text-[10px] font-semibold text-red-500 bg-red-500/10 px-1.5 py-0.5">
                            {isExpired ? "Expired" : "Exhausted"}
                          </span>
                        )}
                      </div>
                      {c.description && (
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{c.description}</p>
                      )}
                    </div>

                    {/* Discount */}
                    <DiscountBadge type={c.discountType} value={c.discountValue} />

                    {/* Uses */}
                    <span className="hidden sm:block text-sm font-mono text-muted-foreground">
                      {c.usedCount}{c.maxUses !== null ? `/${c.maxUses}` : ""}
                    </span>

                    {/* Expiry */}
                    <span className="hidden md:block text-xs text-muted-foreground w-20">
                      {c.expiresAt
                        ? new Date(c.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })
                        : <span className="text-muted-foreground/40">Never</span>
                      }
                    </span>

                    {/* Status */}
                    <div className="w-16 flex justify-center">
                      <StatusBadge active={c.isActive && !isExpired && !isExhausted} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-0.5 w-16">
                      <button
                        onClick={() => openEdit(c)}
                        title="Edit"
                        className="p-1.5 text-muted-foreground hover:text-orange-500 transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCoupon(c)}
                        title="Delete"
                        className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border bg-muted/10 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {search ? `${filtered.length} of ${coupons.length}` : coupons.length} coupon{coupons.length !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {coupons.filter((c) => c.isActive).length} active
            </p>
          </div>
        </div>
      </div>

      {modalOpen && (
        <CouponModal
          coupon={editing}
          onClose={() => setModalOpen(false)}
          onSaved={fetchCoupons}
        />
      )}
    </>
  )
}
