"use client"

import { useEffect, useRef, useState } from "react"
import { Search, ChevronRight, ChevronDown, Award, Eye, CheckCircle, Loader2, X, TrendingUp, TrendingDown, Minus } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

// ── Types ──────────────────────────────────────────────────────────────────

interface Expedition {
  id: string
  title: string
  altitude: number
  location: string
  _count: { slots: number }
}

interface Slot {
  id: string
  label: string | null
  startDate: string
  endDate: string
  maxParticipants: number
  bookedCount: number
  isActive: boolean
  _count: { bookings: number }
}

interface SummitRecord {
  id: string
  status: "SUCCESSFUL" | "FAILED" | "IN_PROGRESS"
  summitDate: string | null
  altitude: number
}

interface Climber {
  bookingId: string
  status: string
  paymentStatus: string
  numberOfPeople: number
  user: { id: string; name: string | null; email: string; image: string | null }
  expedition: { id: string; title: string; altitude: number }
  slot: { startDate: string; endDate: string; label: string | null } | null
  certificate: { id: string; verificationCode: string } | null
  summitRecord: SummitRecord | null
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
}

function bookingBadge(status: string) {
  const map: Record<string, string> = {
    CONFIRMED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    PENDING:   "bg-yellow-500/10  text-yellow-400  border-yellow-500/20",
    CANCELLED: "bg-red-500/10    text-red-400     border-red-500/20",
  }
  return map[status] ?? "bg-muted/30 text-muted-foreground border-border"
}

const SUMMIT_OPTIONS: { value: "SUCCESSFUL" | "FAILED" | "IN_PROGRESS"; label: string; style: string; activeStyle: string }[] = [
  {
    value: "SUCCESSFUL",
    label: "Summited",
    style: "border-border text-muted-foreground hover:border-emerald-500/40 hover:text-emerald-400",
    activeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/40",
  },
  {
    value: "FAILED",
    label: "Failed",
    style: "border-border text-muted-foreground hover:border-red-500/40 hover:text-red-400",
    activeStyle: "bg-red-500/10 text-red-400 border-red-500/40",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    style: "border-border text-muted-foreground hover:border-yellow-500/40 hover:text-yellow-400",
    activeStyle: "bg-yellow-500/10 text-yellow-400 border-yellow-500/40",
  },
]

// ── Sub-components ─────────────────────────────────────────────────────────

function StepIndicator({ step, current }: { step: number; current: number }) {
  const done   = current > step
  const active = current === step
  return (
    <div className={`flex items-center justify-center w-7 h-7 rounded-full border text-xs font-bold transition-colors
      ${done   ? "bg-orange-500 border-orange-500 text-white" :
        active ? "border-orange-500 text-orange-500" :
                 "border-border text-muted-foreground"}`}>
      {done ? <CheckCircle className="h-4 w-4" /> : step}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function CertificateIssuance() {
  const [step, setStep]                   = useState(1)

  // Step 1
  const [query, setQuery]                 = useState("")
  const [expeditions, setExpeditions]     = useState<Expedition[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedExp, setSelectedExp]     = useState<Expedition | null>(null)
  const [dropdownOpen, setDropdownOpen]   = useState(false)
  const searchRef                         = useRef<HTMLDivElement>(null)

  // Step 2
  const [slots, setSlots]                 = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading]   = useState(false)
  const [selectedSlot, setSelectedSlot]   = useState<Slot | null>(null)

  // Step 3
  const [climbers, setClimbers]           = useState<Climber[]>([])
  const [climbersLoading, setClimbersLoading] = useState(false)
  const [savingRecord, setSavingRecord]   = useState<string | null>(null) // userId
  const [issuing, setIssuing]             = useState<string | null>(null) // userId

  // ── Step 1 ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!query.trim()) { setExpeditions([]); setDropdownOpen(false); return }
    const t = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await fetch(`/api/admin/expeditions/search?q=${encodeURIComponent(query)}`)
        setExpeditions(await res.json())
        setDropdownOpen(true)
      } catch { toast.error("Search failed") }
      finally { setSearchLoading(false) }
    }, 280)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [])

  function selectExpedition(exp: Expedition) {
    setSelectedExp(exp); setQuery(exp.title); setDropdownOpen(false)
    setSelectedSlot(null); setClimbers([]); setStep(2); loadSlots(exp.id)
  }

  // ── Step 2 ─────────────────────────────────────────────────────────────

  async function loadSlots(expId: string) {
    setSlotsLoading(true)
    try {
      const res = await fetch(`/api/admin/expeditions/${expId}/slots`)
      setSlots(await res.json())
    } catch { toast.error("Failed to load slots") }
    finally { setSlotsLoading(false) }
  }

  function selectSlot(slot: Slot) {
    setSelectedSlot(slot); setStep(3); loadClimbers(slot.id)
  }

  // ── Step 3 ─────────────────────────────────────────────────────────────

  async function loadClimbers(slotId: string) {
    setClimbersLoading(true)
    try {
      const res = await fetch(`/api/admin/slots/${slotId}/climbers`)
      setClimbers(await res.json())
    } catch { toast.error("Failed to load climbers") }
    finally { setClimbersLoading(false) }
  }

  async function setSummitStatus(climber: Climber, status: "SUCCESSFUL" | "FAILED" | "IN_PROGRESS") {
    // Toggle off if clicking current status
    if (climber.summitRecord?.status === status) {
      setSavingRecord(climber.user.id)
      try {
        const res = await fetch("/api/admin/summit-records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: climber.user.id,
            expeditionId: climber.expedition.id,
            status: "IN_PROGRESS",
            summitDate: null,
            altitude: climber.expedition.altitude,
          }),
        })
        if (!res.ok) throw new Error()
        const record = await res.json()
        setClimbers(prev => prev.map(c =>
          c.user.id === climber.user.id ? { ...c, summitRecord: record } : c
        ))
      } catch { toast.error("Failed to update record") }
      finally { setSavingRecord(null) }
      return
    }

    setSavingRecord(climber.user.id)
    try {
      const summitDate = status === "SUCCESSFUL"
        ? (climber.slot?.endDate ?? new Date().toISOString())
        : null
      const res = await fetch("/api/admin/summit-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: climber.user.id,
          expeditionId: climber.expedition.id,
          status,
          summitDate,
          altitude: climber.expedition.altitude,
        }),
      })
      if (!res.ok) throw new Error()
      const record = await res.json()
      setClimbers(prev => prev.map(c =>
        c.user.id === climber.user.id ? { ...c, summitRecord: record } : c
      ))
      toast.success(`Marked as ${status.toLowerCase().replace("_", " ")} for ${climber.user.name ?? climber.user.email}`)
    } catch { toast.error("Failed to save summit record") }
    finally { setSavingRecord(null) }
  }

  async function issueCertificate(climber: Climber) {
    setIssuing(climber.user.id)
    try {
      const summitDate = climber.summitRecord?.summitDate
        ?? climber.slot?.endDate
        ?? new Date().toISOString()
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId:          climber.user.id,
          expeditionId:    climber.expedition.id,
          summitRecordId:  climber.summitRecord?.id,
          expeditionTitle: climber.expedition.title,
          peakName:        climber.expedition.title,
          altitude:        climber.expedition.altitude,
          summitDate,
        }),
      })
      if (!res.ok) throw new Error()
      const cert = await res.json()
      toast.success(`Certificate issued for ${climber.user.name ?? climber.user.email}`)
      setClimbers(prev => prev.map(c =>
        c.user.id === climber.user.id
          ? { ...c, certificate: { id: cert.id, verificationCode: cert.verificationCode } }
          : c
      ))
    } catch { toast.error("Failed to issue certificate") }
    finally { setIssuing(null) }
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Step header */}
      <div className="flex items-center gap-3">
        {[1, 2, 3].map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <StepIndicator step={s} current={step} />
            <span className={`text-xs font-semibold tracking-wide hidden sm:block ${step === s ? "text-foreground" : "text-muted-foreground"}`}>
              {s === 1 ? "Expedition" : s === 2 ? "Slot" : "Climbers"}
            </span>
            {i < 2 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />}
          </div>
        ))}
      </div>

      {/* ── Step 1 ── */}
      <div className="border border-border">
        <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">Step 1 — Select Expedition</p>
          {selectedExp && step > 1 && (
            <button onClick={() => { setStep(1); setSelectedExp(null); setQuery(""); setSlots([]); setSelectedSlot(null); setClimbers([]) }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              <X className="h-3 w-3" /> Change
            </button>
          )}
        </div>
        <div className="p-5">
          {selectedExp && step > 1 ? (
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-orange-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{selectedExp.title}</p>
                <p className="text-xs text-muted-foreground">{selectedExp.location} · {selectedExp.altitude.toLocaleString()}m</p>
              </div>
            </div>
          ) : (
            <div ref={searchRef} className="relative">
              <div className="flex items-center gap-2 border border-border px-3 py-2 focus-within:border-orange-500/50 transition-colors">
                {searchLoading
                  ? <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin shrink-0" />
                  : <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search expeditions by name…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                />
                {query && (
                  <button onClick={() => { setQuery(""); setExpeditions([]); setDropdownOpen(false) }}>
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                )}
              </div>
              {dropdownOpen && expeditions.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 border border-border border-t-0 bg-background shadow-xl divide-y divide-border max-h-64 overflow-y-auto">
                  {expeditions.map(exp => (
                    <button key={exp.id} onClick={() => selectExpedition(exp)}
                      className="w-full px-4 py-3 text-left hover:bg-muted/30 transition-colors flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{exp.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{exp.location} · {exp.altitude.toLocaleString()}m</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{exp._count.slots} slot{exp._count.slots !== 1 ? "s" : ""}</span>
                    </button>
                  ))}
                </div>
              )}
              {dropdownOpen && !searchLoading && expeditions.length === 0 && query.trim() && (
                <div className="absolute z-20 top-full left-0 right-0 border border-border border-t-0 bg-background px-4 py-4">
                  <p className="text-sm text-muted-foreground">No expeditions found for &quot;{query}&quot;</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Step 2 ── */}
      {step >= 2 && (
        <div className="border border-border">
          <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
            <p className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">Step 2 — Select Slot</p>
            {selectedSlot && step > 2 && (
              <button onClick={() => { setStep(2); setSelectedSlot(null); setClimbers([]) }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <X className="h-3 w-3" /> Change
              </button>
            )}
          </div>
          {slotsLoading ? (
            <div className="p-5 space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-muted/20 animate-pulse" />)}</div>
          ) : selectedSlot && step > 2 ? (
            <div className="p-5 flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-orange-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{selectedSlot.label ?? `${fmtDate(selectedSlot.startDate)} – ${fmtDate(selectedSlot.endDate)}`}</p>
                <p className="text-xs text-muted-foreground">{selectedSlot._count.bookings} booking{selectedSlot._count.bookings !== 1 ? "s" : ""} · {selectedSlot.bookedCount}/{selectedSlot.maxParticipants} participants</p>
              </div>
            </div>
          ) : slots.length === 0 ? (
            <div className="p-5"><p className="text-sm text-muted-foreground">No slots found for this expedition.</p></div>
          ) : (
            <div className="divide-y divide-border">
              {slots.map(slot => (
                <button key={slot.id} onClick={() => selectSlot(slot)}
                  className="w-full px-5 py-4 text-left hover:bg-muted/20 transition-colors flex items-center justify-between gap-4 group">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold group-hover:text-orange-500 transition-colors">
                      {slot.label ?? `${fmtDate(slot.startDate)} – ${fmtDate(slot.endDate)}`}
                    </p>
                    {slot.label && <p className="text-xs text-muted-foreground">{fmtDate(slot.startDate)} – {fmtDate(slot.endDate)}</p>}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-semibold">{slot._count.bookings} bookings</p>
                      <p className="text-xs text-muted-foreground">{slot.bookedCount}/{slot.maxParticipants} slots</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 border ${slot.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-muted/30 text-muted-foreground border-border"}`}>
                      {slot.isActive ? "Active" : "Inactive"}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step 3 ── */}
      {step >= 3 && (
        <div className="border border-border">
          <div className="px-5 py-3 border-b border-border bg-muted/20">
            <p className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">Step 3 — Summit Results & Certificates</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Tag each climber&apos;s result, then issue certificates to those who summited.</p>
          </div>

          {climbersLoading ? (
            <div className="p-5 space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-muted/40 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-muted/40 rounded w-32" />
                    <div className="h-2.5 bg-muted/20 rounded w-48" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-7 w-20 bg-muted/30 rounded" />
                    <div className="h-7 w-16 bg-muted/30 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : climbers.length === 0 ? (
            <div className="px-5 py-16 flex flex-col items-center gap-3">
              <Award className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No bookings found for this slot.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {climbers.map((climber) => {
                const isSaving    = savingRecord === climber.user.id
                const isIssuing   = issuing === climber.user.id
                const hasCert     = !!climber.certificate
                const summitStatus = climber.summitRecord?.status ?? null
                const initials    = (climber.user.name ?? climber.user.email).slice(0, 1).toUpperCase()
                const canIssueCert = summitStatus === "SUCCESSFUL" && !hasCert

                return (
                  <div key={climber.bookingId} className="px-5 py-4 hover:bg-muted/10 transition-colors">
                    <div className="flex items-start gap-3">

                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[11px] font-black text-orange-500">{initials}</span>
                      </div>

                      {/* Name + email + booking badge */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold">{climber.user.name ?? "—"}</p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 border ${bookingBadge(climber.status)}`}>
                            {climber.status}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 border ${bookingBadge(climber.paymentStatus)}`}>
                            {climber.paymentStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{climber.user.email}</p>

                        {/* Summit status buttons */}
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground mr-1">Result:</span>
                          {SUMMIT_OPTIONS.map(opt => {
                            const isActive = summitStatus === opt.value
                            return (
                              <button
                                key={opt.value}
                                onClick={() => setSummitStatus(climber, opt.value)}
                                disabled={isSaving}
                                className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 border transition-colors disabled:opacity-40
                                  ${isActive ? opt.activeStyle : opt.style}`}
                              >
                                {isSaving && isActive
                                  ? <Loader2 className="h-3 w-3 animate-spin" />
                                  : opt.value === "SUCCESSFUL"
                                    ? <TrendingUp className="h-3 w-3" />
                                    : opt.value === "FAILED"
                                      ? <TrendingDown className="h-3 w-3" />
                                      : <Minus className="h-3 w-3" />
                                }
                                {opt.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Certificate column */}
                      <div className="shrink-0 flex items-center mt-0.5">
                        {hasCert ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 whitespace-nowrap">
                              <CheckCircle className="h-3 w-3" /> Issued
                            </span>
                            <Link href={`/certificates/${climber.certificate!.verificationCode}`} target="_blank">
                              <button className="p-1.5 text-muted-foreground hover:text-orange-500 transition-colors" title="View">
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            </Link>
                          </div>
                        ) : (
                          <button
                            onClick={() => issueCertificate(climber)}
                            disabled={!canIssueCert || isIssuing}
                            title={!canIssueCert ? "Mark as Summited first" : "Issue certificate"}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border transition-colors whitespace-nowrap
                              ${canIssueCert
                                ? "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20"
                                : "border-border text-muted-foreground/40 cursor-not-allowed"}`}
                          >
                            {isIssuing
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Award className="h-3 w-3" />}
                            {isIssuing ? "Issuing…" : "Issue"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {climbers.length > 0 && (
            <div className="px-5 py-3 border-t border-border bg-muted/10 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="text-emerald-400 font-semibold">
                  {climbers.filter(c => c.summitRecord?.status === "SUCCESSFUL").length} summited
                </span>
                <span className="text-red-400 font-semibold">
                  {climbers.filter(c => c.summitRecord?.status === "FAILED").length} failed
                </span>
                <span>
                  {climbers.filter(c => !c.summitRecord || c.summitRecord.status === "IN_PROGRESS").length} untagged
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {climbers.filter(c => c.certificate).length} of {climbers.length} certificates issued
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
