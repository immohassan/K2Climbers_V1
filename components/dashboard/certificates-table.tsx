"use client"

import { useEffect, useState } from "react"
import { Eye, Download, Award, Trash2, AlertTriangle, X } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import toast from "react-hot-toast"

interface Certificate {
  id: string
  expeditionTitle: string
  peakName: string
  altitude: number
  summitDate: Date
  verificationCode: string
  qrCodeUrl: string | null
  pdfUrl: string | null
  user: { name: string | null; email: string }
}

export function CertificatesTable() {
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [revokeTarget, setRevokeTarget] = useState<Certificate | null>(null)
  const [revoking, setRevoking] = useState(false)

  useEffect(() => { fetchCertificates() }, [])

  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/certificates")
      setCerts(await res.json())
    } catch { toast.error("Failed to load certificates") }
    finally { setLoading(false) }
  }

  const handleRevoke = async () => {
    if (!revokeTarget) return
    setRevoking(true)
    try {
      const res = await fetch(`/api/certificates/${revokeTarget.id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Certificate revoked")
        setRevokeTarget(null)
        fetchCertificates()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to revoke certificate")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setRevoking(false)
    }
  }

  if (loading) {
    return (
      <div className="border border-border divide-y divide-border">
        <div className="px-5 py-4 h-12 animate-pulse bg-muted/20" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex gap-4 animate-pulse">
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-muted rounded w-36" />
              <div className="h-2.5 bg-muted/60 rounded w-52" />
            </div>
            <div className="h-3.5 bg-muted rounded w-20" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="border border-border">
        {/* Header */}
        <div className="px-5 py-3 border-b border-border grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-4 bg-muted/30">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Climber</p>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Peak / Expedition</p>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground hidden sm:block w-20 text-right">Altitude</p>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground hidden md:block w-28 text-right">Date</p>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground w-20 text-right">Actions</p>
        </div>

        {certs.length === 0 ? (
          <div className="px-5 py-16 flex flex-col items-center gap-3">
            <Award className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No certificates issued yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {certs.map((cert) => (
              <div key={cert.id} className="px-5 py-4 grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-4 hover:bg-muted/20 transition-colors group">
                {/* Climber */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-orange-500 transition-colors">
                    {cert.user.name || "Unknown"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{cert.user.email}</p>
                </div>

                {/* Peak */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{cert.peakName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{cert.expeditionTitle}</p>
                </div>

                {/* Altitude */}
                <span className="hidden sm:block text-sm font-mono text-right w-20">
                  {cert.altitude.toLocaleString()}m
                </span>

                {/* Date */}
                <span className="hidden md:block text-xs text-muted-foreground text-right w-28">
                  {formatDate(cert.summitDate)}
                </span>

                {/* Actions */}
                <div className="flex items-center justify-end gap-0.5 w-20">
                  <Link href={`/certificates/${cert.verificationCode}`} title="View certificate">
                    <button className="p-1.5 text-muted-foreground hover:text-orange-500 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </Link>
                  <Link href={`/certificates/${cert.verificationCode}/print`} target="_blank" title="Download PDF">
                    <button className="p-1.5 text-muted-foreground hover:text-blue-400 transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                  </Link>
                  <button
                    onClick={() => setRevokeTarget(cert)}
                    title="Revoke certificate"
                    className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-5 py-3 border-t border-border bg-muted/10">
          <p className="text-xs text-muted-foreground">{certs.length} certificate{certs.length !== 1 ? "s" : ""} issued</p>
        </div>
      </div>

      {/* Revoke confirmation modal */}
      {revokeTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget && !revoking) setRevokeTarget(null) }}
        >
          <div className="w-full max-w-sm bg-background border border-border shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
                <p className="font-black text-sm">Revoke Certificate</p>
              </div>
              <button
                onClick={() => setRevokeTarget(null)}
                disabled={revoking}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Details */}
            <div className="px-5 py-4 border-b border-border space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                You are about to permanently revoke the summit certificate for:
              </p>
              <div className="bg-muted/20 border border-border px-4 py-3 space-y-1">
                <p className="text-sm font-bold">{revokeTarget.user.name || "Unknown Climber"}</p>
                <p className="text-xs text-muted-foreground">{revokeTarget.user.email}</p>
                <p className="text-xs text-orange-500 font-semibold mt-1">
                  {revokeTarget.peakName} · {revokeTarget.altitude.toLocaleString()}m
                </p>
                <p className="text-xs text-muted-foreground">{revokeTarget.expeditionTitle}</p>
              </div>
              <p className="text-xs text-red-500/80">
                This will permanently delete the certificate and invalidate its verification link. This cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="px-5 py-4 flex gap-3">
              <button
                onClick={() => setRevokeTarget(null)}
                disabled={revoking}
                className="flex-1 border border-border py-2.5 text-sm font-semibold hover:border-orange-500/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                disabled={revoking}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-2.5 text-sm font-semibold transition-colors"
              >
                {revoking ? "Revoking…" : "Revoke Certificate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
