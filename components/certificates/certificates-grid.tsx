"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mountain, Calendar, Download, Share2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

interface Certificate {
  id: string
  expeditionTitle: string
  peakName: string
  altitude: number
  summitDate: Date
  verificationCode: string
  qrCodeUrl: string | null
  pdfUrl: string | null
}

export function CertificatesGrid() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/certificates")
      .then((res) => res.json())
      .then((data) => {
        setCertificates(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching certificates:", error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="text-center py-20">Loading certificates...</div>
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg mb-4">
          You don't have any certificates yet.
        </p>
        <p className="text-muted-foreground">
          Complete an expedition and summit successfully to earn your first certificate!
        </p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {certificates.map((cert) => (
        <Card key={cert.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <CardTitle className="text-xl">{cert.peakName}</CardTitle>
              <Badge variant="outline">Verified</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{cert.expeditionTitle}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Mountain className="h-4 w-4 mr-2" />
                {cert.altitude}m
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(cert.summitDate)}
              </div>
            </div>
            <div className="pt-4 border-t border-border flex gap-2">
              <Link href={`/certificates/${cert.verificationCode}`} className="flex-1">
                <button className="w-full text-sm px-4 py-2 bg-card border border-border rounded-md hover:bg-accent transition">
                  View
                </button>
              </Link>
              {cert.pdfUrl && (
                <a
                  href={cert.pdfUrl}
                  download
                  className="flex-1 text-sm px-4 py-2 bg-card border border-border rounded-md hover:bg-accent transition flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
