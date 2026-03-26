"use client"

import { useState } from "react"
import Link from "next/link"
import { Download, Share2, ArrowLeft } from "lucide-react"
import { CertificateCard } from "./certificate-card"

interface Certificate {
  id: string
  expeditionTitle: string
  peakName: string
  altitude: number
  summitDate: Date
  verificationCode: string
  qrCodeUrl: string | null
  pdfUrl: string | null
  user: { name: string | null; image?: string | null }
}

export function CertificateView({ certificate }: { certificate: Certificate }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).default

      const el = document.getElementById("certificate-card")
      if (!el) return

      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgRatio = canvas.height / canvas.width
      const imgW = pageW
      const imgH = pageW * imgRatio

      // Center vertically on page
      const yOffset = imgH < pageH ? (pageH - imgH) / 2 : 0
      pdf.addImage(imgData, "PNG", 0, yOffset, imgW, imgH)
      pdf.save(`certificate-${certificate.peakName.replace(/\s+/g, "-").toLowerCase()}.pdf`)
    } catch (e) {
      console.error("PDF generation failed", e)
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: `Summit Certificate — ${certificate.peakName}`, url })
    } else {
      await navigator.clipboard.writeText(url)
      alert("Link copied!")
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Profile
      </Link>

      {/* Certificate */}
      <CertificateCard certificate={certificate} />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 text-xs font-semibold px-5 py-2.5 bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors disabled:opacity-60"
        >
          <Download className="h-3.5 w-3.5" />
          {downloading ? "Generating…" : "Download PDF"}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 text-xs font-semibold px-5 py-2.5 border border-border hover:border-orange-500/50 hover:text-orange-500 transition-colors"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>
      </div>
    </div>
  )
}
