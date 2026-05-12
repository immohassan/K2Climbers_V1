"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Award, Mountain, Calendar, CheckCircle2, Plus, Trash2, Eye, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import toast from "react-hot-toast"
import { recordCountsAsSummit } from "@/lib/summit-utils"

interface SummitRecord {
  id: string
  status: string
  summitDate: string | null
  altitude: number
  expedition: {
    id: string
    title: string
    slug: string
    altitude: number
    category: string
  }
}

interface CertInfo {
  id: string
  verificationCode: string
}

export function UserCertificatesManager({ userId, userName }: { userId: string; userName: string }) {
  const [records, setRecords] = useState<SummitRecord[]>([])
  const [certsByRecordId, setCertsByRecordId] = useState<Record<string, CertInfo>>({})
  const [loading, setLoading] = useState(true)
  const [issuingId, setIssuingId] = useState<string | null>(null)
  const [deletingCertId, setDeletingCertId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${userId}/summit-records`)
      if (res.ok) {
        const data = await res.json()
        setRecords(data.records)
        setCertsByRecordId(data.certsByRecordId)
      }
    } catch {
      toast.error("Failed to load summit records")
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchData() }, [fetchData])

  const issueCertificate = async (record: SummitRecord) => {
    setIssuingId(record.id)
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          expeditionId: record.expedition.id,
          summitRecordId: record.id,
          expeditionTitle: record.expedition.title,
          peakName: record.expedition.title,
          altitude: record.altitude,
          summitDate: record.summitDate ?? new Date().toISOString(),
        }),
      })
      if (res.ok) {
        toast.success("Certificate issued!")
        fetchData()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to issue certificate")
      }
    } catch {
      toast.error("Failed to issue certificate")
    } finally {
      setIssuingId(null)
    }
  }

  const deleteCertificate = async (certId: string) => {
    setDeletingCertId(certId)
    try {
      const res = await fetch(`/api/certificates/${certId}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Certificate revoked")
        setConfirmDeleteId(null)
        fetchData()
      } else {
        toast.error("Failed to revoke certificate")
      }
    } catch {
      toast.error("Failed to revoke certificate")
    } finally {
      setDeletingCertId(null)
    }
  }

  const successfulRecords = records.filter((r) => r.status === "SUCCESSFUL")
  const otherRecords = records.filter((r) => r.status !== "SUCCESSFUL")

  if (loading) {
    return (
      <div className="border border-border">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Award className="h-4 w-4 text-orange-500" />
          <h3 className="font-black text-sm">Summit Records & Certificates</h3>
        </div>
        <div className="px-5 py-8 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-orange-500" />
          <h3 className="font-black text-sm">Summit Records & Certificates</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {records.length} record{records.length !== 1 ? "s" : ""}
        </span>
      </div>

      {records.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <Mountain className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No summit records for this user.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {/* Successful records — eligible for certificate */}
          {successfulRecords.length > 0 && (
            <>
              <div className="px-5 py-2 bg-muted/20">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                  Successful Summits
                </p>
              </div>
              {successfulRecords.map((record) => {
                const cert = certsByRecordId[record.id]
                const counts = recordCountsAsSummit(record.expedition.category)

                return (
                  <div key={record.id} className="px-5 py-4 flex items-center gap-4 group hover:bg-muted/20 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm truncate">
                          {record.expedition.title}
                        </p>
                        {counts && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-500/10 px-1.5 py-0.5">
                            counts
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground font-mono flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mountain className="h-3 w-3" />
                          {record.altitude.toLocaleString()}m
                        </span>
                        {record.summitDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(record.summitDate)}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-green-500">
                          <CheckCircle2 className="h-3 w-3" />
                          Successful
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {cert ? (
                        <>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-2 py-1 flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            Cert Issued
                          </span>
                          <Link
                            href={`/certificates/${cert.verificationCode}`}
                            target="_blank"
                            title="View certificate"
                            className="p-1.5 text-muted-foreground hover:text-orange-500 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {confirmDeleteId === cert.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => deleteCertificate(cert.id)}
                                disabled={deletingCertId === cert.id}
                                className="text-[10px] font-bold px-2 py-1 bg-red-500 text-white hover:bg-red-600 transition-colors"
                              >
                                {deletingCertId === cert.id ? "..." : "Confirm"}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-[10px] text-muted-foreground hover:text-foreground px-1"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(cert.id)}
                              title="Revoke certificate"
                              className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => issueCertificate(record)}
                          disabled={issuingId === record.id}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-orange-500/40 text-orange-500 hover:bg-orange-500/10 transition-colors disabled:opacity-50"
                        >
                          {issuingId === record.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                          Issue Certificate
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </>
          )}

          {/* Other records (no certificate option) */}
          {otherRecords.length > 0 && (
            <>
              <div className="px-5 py-2 bg-muted/20">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                  Other Attempts
                </p>
              </div>
              {otherRecords.map((record) => (
                <div key={record.id} className="px-5 py-4 flex items-center gap-4 opacity-60">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{record.expedition.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground font-mono">
                      <span>{record.altitude.toLocaleString()}m</span>
                      {record.summitDate && <span>{formatDate(record.summitDate)}</span>}
                      <span className={`uppercase font-bold tracking-wider text-[10px] px-1.5 py-0.5 ${
                        record.status === "FAILED" ? "text-red-500 bg-red-500/10"
                        : "text-yellow-500 bg-yellow-500/10"
                      }`}>
                        {record.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
