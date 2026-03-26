"use client"

import { useEffect, useState } from "react"
import { Eye, Download, Award } from "lucide-react"
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

  useEffect(() => { fetchCertificates() }, [])

  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/certificates")
      setCerts(await res.json())
    } catch { toast.error("Failed to load certificates") }
    finally { setLoading(false) }
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
    <div className="border border-border">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-4 bg-muted/30">
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Climber</p>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground">Peak / Expedition</p>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground hidden sm:block w-20 text-right">Altitude</p>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground hidden md:block w-28 text-right">Date</p>
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground w-16 text-right">Actions</p>
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
              <div className="flex items-center justify-end gap-0.5 w-16">
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
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="px-5 py-3 border-t border-border bg-muted/10">
        <p className="text-xs text-muted-foreground">{certs.length} certificate{certs.length !== 1 ? "s" : ""} issued</p>
      </div>
    </div>
  )
}
