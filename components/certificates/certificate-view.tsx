"use client"

import { useEffect, useRef, useState } from "react"
import { Download, Share2 } from "lucide-react"
import { CertificateCard } from "./certificate-card"
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
  user: { name: string | null; image?: string | null }
}

// Certificate renders at this fixed width. Aspect ratio is portrait A4 (210:297).
const CERT_W = 620
const CERT_H = Math.round(CERT_W * 297 / 210)

export function CertificateView({ certificate }: { certificate: Certificate }) {
  const [downloading, setDownloading] = useState(false)
  const outerRef = useRef<HTMLDivElement>(null)
  const offscreenRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // Compute scale so the fixed-width cert fits the container
  useEffect(() => {
    function measure() {
      if (!outerRef.current) return
      const available = outerRef.current.clientWidth
      setScale(available < CERT_W ? available / CERT_W : 1)
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  const handleDownload = async () => {
    setDownloading(true)
    const toastId = toast.loading("Generating PDF…")
    try {
      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).default

      // Use the off-screen full-size element (no CSS scale transform)
      // so html2canvas gets accurate pixel dimensions on all devices
      const el = offscreenRef.current?.querySelector("#certificate-card-offscreen") as HTMLElement | null
      if (!el) throw new Error("Certificate element not found")

      // Give canvases inside time to paint before capture
      await new Promise((r) => setTimeout(r, 200))

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#0a0a0a",
        logging: false,
        width: CERT_W,
        height: CERT_H,
        onclone: (_doc, clonedEl) => {
          // Copy canvas pixel data into the clone (html2canvas can't read canvas contents directly)
          const srcCanvases = el.querySelectorAll("canvas")
          const dstCanvases = clonedEl.querySelectorAll("canvas")
          srcCanvases.forEach((src, i) => {
            const dst = dstCanvases[i] as HTMLCanvasElement | undefined
            if (!dst) return
            dst.width = src.width
            dst.height = src.height
            dst.getContext("2d")?.drawImage(src, 0, 0)
          })
        },
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgRatio = canvas.height / canvas.width
      const imgW = pageW
      const imgH = pageW * imgRatio
      const yOffset = imgH < pageH ? (pageH - imgH) / 2 : 0
      pdf.addImage(imgData, "PNG", 0, yOffset, imgW, imgH)
      pdf.save(`certificate-${certificate.peakName.replace(/\s+/g, "-").toLowerCase()}.pdf`)
      toast.success("PDF downloaded!", { id: toastId })
    } catch (e) {
      console.error("PDF generation failed", e)
      toast.error("Could not generate PDF. Please try again.", { id: toastId })
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
    <div className="w-full space-y-6">
      {/*
        Outer div measures available width.
        Height is explicitly set to scaled CERT_H so the page flow is correct
        even though the inner div is position:absolute.
      */}
      <div
        ref={outerRef}
        style={{ width: "100%", height: CERT_H * scale, position: "relative" }}
      >
        {/* Inner div: always CERT_W wide, scaled down to fit */}
        <div
          style={{
            width: CERT_W,
            height: CERT_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <CertificateCard certificate={certificate} />
        </div>
      </div>

      {/* Off-screen full-size clone for html2canvas — no CSS scale transform applied */}
      <div
        ref={offscreenRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: CERT_W,
          height: CERT_H,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <CertificateCard certificate={certificate} idOverride="certificate-card-offscreen" />
      </div>

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
