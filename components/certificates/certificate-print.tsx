"use client"

import { useEffect } from "react"
import { CertificateCard } from "./certificate-card"

interface Certificate {
  id: string
  expeditionTitle: string
  peakName: string
  altitude: number
  summitDate: Date
  verificationCode: string
  qrCodeUrl: string | null
  user: { name: string | null; image: string | null }
}

export function CertificatePrint({ certificate }: { certificate: Certificate }) {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
          background: #f5f5f5 !important;
          font-family: 'Georgia', serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
        }
        .pw {
          width: 100vw; min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 40px 24px; background: #f5f5f5;
        }
        .cw { width: 600px; max-width: 100%; }
        .btn-print {
          position: fixed; bottom: 28px; right: 28px;
          background: #1a1a1a; color: white; border: none;
          padding: 11px 22px; font-size: 12px; font-family: sans-serif;
          letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; display: flex; align-items: center; gap: 8px; z-index: 200;
        }
        .btn-back {
          position: fixed; bottom: 28px; left: 28px;
          background: transparent; color: #666; border: 1px solid #ccc;
          padding: 11px 22px; font-size: 12px; font-family: sans-serif;
          letter-spacing: 0.1em; text-transform: uppercase;
          text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
        }
        @media print {
          html, body { background: #ffffff !important; }
          .pw { padding: 0 !important; background: #ffffff !important; display: block !important; }
          .cw { width: 100% !important; max-width: 100% !important; }
          .btn-print, .btn-back { display: none !important; }
        }
      `}</style>

      <div className="pw">
        <div className="cw">
          <CertificateCard certificate={certificate} />
        </div>
      </div>

      <button className="btn-print" onClick={() => window.print()}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
        Print / Save PDF
      </button>
      <a className="btn-back" href={`/certificates/${certificate.verificationCode}`}>← Back</a>
    </>
  )
}
