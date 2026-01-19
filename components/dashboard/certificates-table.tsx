"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Download } from "lucide-react"
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
  user: {
    name: string | null
    email: string
  }
}

export function CertificatesTable() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/certificates")
      const data = await res.json()
      setCertificates(data)
    } catch (error) {
      console.error("Error fetching certificates:", error)
      toast.error("Failed to load certificates")
    } finally {
      setLoading(false)
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
                <th className="text-left p-4 font-semibold">Climber</th>
                <th className="text-left p-4 font-semibold">Peak</th>
                <th className="text-left p-4 font-semibold">Expedition</th>
                <th className="text-left p-4 font-semibold">Altitude</th>
                <th className="text-left p-4 font-semibold">Date</th>
                <th className="text-left p-4 font-semibold">Verification</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No certificates issued yet.
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={cert.id} className="border-b border-border hover:bg-card">
                    <td className="p-4">
                      <div className="font-medium">{cert.user.name || "Unknown"}</div>
                      <div className="text-sm text-muted-foreground">{cert.user.email}</div>
                    </td>
                    <td className="p-4 font-semibold">{cert.peakName}</td>
                    <td className="p-4 text-sm text-muted-foreground">{cert.expeditionTitle}</td>
                    <td className="p-4">{cert.altitude}m</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDate(cert.summitDate)}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="font-mono text-xs">
                        {cert.verificationCode.slice(0, 8)}...
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/certificates/${cert.verificationCode}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {cert.pdfUrl && (
                          <a href={cert.pdfUrl} download>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
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
