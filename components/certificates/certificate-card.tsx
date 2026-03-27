"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"

interface CertificateCardProps {
  certificate: {
    expeditionTitle: string
    peakName: string
    altitude: number
    summitDate: Date
    verificationCode: string
    qrCodeUrl: string | null
    user: { name: string | null }
  }
}

function formatDateLong(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// Site colours
const GOLD   = "#b49450"
const GOLD_D = "rgba(180,148,80,0.55)"
const WHITE  = "#f4f4f5"
const MUTED  = "rgba(244,244,245,0.45)"
const BG     = "#0a0a0a"
const BORDER = "rgba(180,148,80,0.3)"

// Draw mountain outlines onto a canvas so html2canvas captures them reliably
function MountainCanvas({ style }: { style: React.CSSProperties }) {
  const ref = useRef<HTMLCanvasElement>(null)

  function draw(canvas: HTMLCanvasElement) {
    const dpr = window.devicePixelRatio || 1
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    if (!w || !h) return
    canvas.width  = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, h)

    const sx = w / 800
    const sy = h / 400

    function drawRange(points: [number, number][], strokeColor: string, lineWidth: number) {
      ctx!.beginPath()
      ctx!.moveTo(points[0][0] * sx, points[0][1] * sy)
      for (let i = 1; i < points.length; i++) {
        ctx!.lineTo(points[i][0] * sx, points[i][1] * sy)
      }
      ctx!.strokeStyle = strokeColor
      ctx!.lineWidth = lineWidth
      ctx!.stroke()
    }

    drawRange([
      [0,400],[60,240],[140,310],[240,160],[320,250],[400,100],
      [480,200],[560,130],[640,210],[720,150],[800,200],[800,400],
    ], "rgba(255,255,255,0.07)", 1.2)

    drawRange([
      [0,400],[40,300],[120,340],[200,220],[300,280],[380,160],
      [460,240],[540,170],[620,250],[700,190],[800,240],[800,400],
    ], "rgba(255,255,255,0.05)", 1)

    drawRange([
      [0,400],[80,350],[160,380],[260,260],[340,310],[420,180],
      [500,260],[580,200],[680,290],[760,230],[800,270],[800,400],
    ], "rgba(180,148,80,0.22)", 1.8)
  }

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    draw(canvas)
    const ro = new ResizeObserver(() => draw(canvas))
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  return <canvas ref={ref} style={style} />
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/settings/logo")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d?.logoUrl && setLogoUrl(d.logoUrl))
      .catch(() => {})
  }, [])

  return (
    <div
      id="certificate-card"
      style={{
        width: "100%",
        aspectRatio: "210 / 297",
        background: BG,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Rotated inner wrapper */}
      <div style={{
        position: "absolute",
        width: "calc(100% * 297 / 210)",
        height: "calc(100% * 210 / 297)",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) rotate(-90deg)",
        transformOrigin: "center center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4% 6%",
        boxSizing: "border-box",
      }}>

        {/* ── Mountain canvas background ── */}
        <MountainCanvas style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "48%",
          pointerEvents: "none",
          zIndex: 0,
        }} />

        {/* ── Gold border ── */}
        <div style={{ position:"absolute", inset:14, border:`1px solid ${BORDER}`, pointerEvents:"none", zIndex:2 }} />

        {/* ── Content ── */}
        <div style={{ position:"relative", zIndex:3, width:"100%", display:"flex", flexDirection:"column", alignItems:"center", gap:0 }}>

          {/* Logo */}
          <div style={{ marginBottom: 16 }}>
            {logoUrl ? (
              <Image src={logoUrl} alt="K2 Climbers" width={100} height={100} style={{ objectFit:"contain", display:"block" }} />
            ) : (
              <svg width="84" height="84" viewBox="0 0 60 60" fill="none">
                <polygon points="30,5 54,50 6,50" fill="none" stroke={GOLD} strokeWidth="1.5"/>
                <polygon points="30,5 36,20 24,20" fill={GOLD} opacity="0.5"/>
                <line x1="6" y1="50" x2="54" y2="50" stroke={GOLD} strokeWidth="1.5"/>
              </svg>
            )}
          </div>

          {/* Heading */}
          <div style={{
            fontSize: 11, letterSpacing: "0.3em",
            textTransform: "uppercase", color: GOLD,
            fontWeight: 600, marginBottom: 18,
          }}>
            Certificate of Summit Success
          </div>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:10, width:"55%", marginBottom:18 }}>
            <div style={{ flex:1, height:1, background:`linear-gradient(to right, transparent, ${GOLD})` }} />
            <div style={{ width:4, height:4, background:GOLD, transform:"rotate(45deg)", flexShrink:0 }} />
            <div style={{ flex:1, height:1, background:`linear-gradient(to left, transparent, ${GOLD})` }} />
          </div>

          {/* Bestowed */}
          <div style={{
            fontSize: 11, color: MUTED,
            letterSpacing: "0.12em", fontStyle: "italic",
            marginBottom: 8,
          }}>
            This honor is proudly bestowed upon
          </div>

          {/* Name */}
          <div style={{
            fontSize: 32, color: WHITE,
            fontWeight: 800, letterSpacing: "-0.01em",
            marginBottom: 18, textAlign: "center",
            lineHeight: 1.15,
          }}>
            {certificate.user.name || "Climber"}
          </div>

          {/* Achievement */}
          <div style={{
            fontSize: 11, color: MUTED,
            letterSpacing: "0.06em", lineHeight: 1.8,
            textAlign: "center", marginBottom: 20,
          }}>
            For successfully summiting{" "}
            <span style={{ color: WHITE, fontWeight: 700 }}>{certificate.peakName}</span>
            {" "}at{" "}
            <span style={{ color: GOLD, fontWeight: 700 }}>{certificate.altitude.toLocaleString()}m</span>
            {" "}on{" "}
            <span style={{ color: WHITE, fontWeight: 600 }}>{formatDateLong(certificate.summitDate)}</span>
          </div>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:10, width:"55%", marginBottom:18 }}>
            <div style={{ flex:1, height:1, background:`linear-gradient(to right, transparent, ${BORDER})` }} />
            <div style={{ width:3, height:3, background:GOLD_D, transform:"rotate(45deg)", flexShrink:0 }} />
            <div style={{ flex:1, height:1, background:`linear-gradient(to left, transparent, ${BORDER})` }} />
          </div>

          {/* Quote */}
          <div style={{
            fontSize: 10, color: "rgba(244,244,245,0.28)",
            fontStyle: "italic", lineHeight: 1.9,
            textAlign: "center", width: "72%",
            letterSpacing: "0.04em", marginBottom: 22,
          }}>
            You didn&apos;t conquer the mountain, you earned its permission.
            May this achievement remind you that every peak is within reach
            with courage, patience and perseverance.
          </div>

          {/* ── Wax Stamp ── */}
          <div style={{ position:"relative", width:72, height:72, marginBottom:10 }}>
            {/* Outer glow */}
            <div style={{
              position:"absolute", inset:-8, borderRadius:"50%",
              background:`radial-gradient(circle, rgba(160,140,80,0.10) 0%, transparent 68%)`,
            }} />
            <svg width="72" height="72" viewBox="0 0 72 72">
              <defs>
                {/* Dull aged-gold body gradient — dark olive base, no copper/orange */}
                <radialGradient id="waxGrad" cx="38%" cy="32%" r="62%">
                  <stop offset="0%"   stopColor="#6b6030"/>
                  <stop offset="50%"  stopColor="#4a4220"/>
                  <stop offset="100%" stopColor="#1e1c0d"/>
                </radialGradient>
                {/* Dull gold for rings / text / lines */}
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#c8b46a"/>
                  <stop offset="50%"  stopColor="#a08840"/>
                  <stop offset="100%" stopColor="#7a6428"/>
                </linearGradient>
                {/* Edge darkening */}
                <radialGradient id="rimGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="78%" stopColor="transparent"/>
                  <stop offset="100%" stopColor="rgba(0,0,0,0.45)"/>
                </radialGradient>
              </defs>

              {/* Notched outer edge — 16-point */}
              <polygon
                points={Array.from({length:32}, (_,i) => {
                  const angle = (i * Math.PI * 2) / 32 - Math.PI / 2
                  const r = i % 2 === 0 ? 35 : 31
                  return `${36 + r * Math.cos(angle)},${36 + r * Math.sin(angle)}`
                }).join(" ")}
                fill="url(#waxGrad)"
              />

              {/* Main circle */}
              <circle cx="36" cy="36" r="31" fill="url(#waxGrad)"/>
              <circle cx="36" cy="36" r="31" fill="url(#rimGrad)"/>

              {/* Subtle highlight */}
              <ellipse cx="29" cy="24" rx="9" ry="5" fill="rgba(200,180,100,0.08)"/>

              {/* Outer ring */}
              <circle cx="36" cy="36" r="27.5" fill="none" stroke="url(#goldGrad)" strokeWidth="1"/>
              {/* Dashed inner ring */}
              <circle cx="36" cy="36" r="22" fill="none" stroke="url(#goldGrad)" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.7"/>

              {/* Mountain */}
              <polyline points="36,14 44,26 28,26" fill="none" stroke="url(#goldGrad)" strokeWidth="1.1" strokeLinejoin="round"/>
              <polygon points="36,14 39,21 33,21" fill="url(#goldGrad)" opacity="0.4"/>
              <line x1="33" y1="19" x2="39" y2="19" stroke="#c8b46a" strokeWidth="0.7" opacity="0.5"/>

              {/* K2 */}
              <text x="36" y="38" textAnchor="middle" fill="url(#goldGrad)" fontSize="10" fontWeight="700" fontFamily="Inter, sans-serif" letterSpacing="2">K2</text>
              {/* CLIMBERS */}
              <text x="36" y="47" textAnchor="middle" fill="url(#goldGrad)" fontSize="4.5" fontFamily="Inter, sans-serif" letterSpacing="2" opacity="0.8">CLIMBERS</text>
            </svg>
          </div>

          {/* Verified */}
          <div style={{
            fontSize: 8, letterSpacing: "0.3em",
            textTransform: "uppercase", color: GOLD_D,
            marginBottom: 5,
          }}>
            Verified by K2 Climbers
          </div>

          {/* Code */}
          <div style={{
            fontSize: 7, letterSpacing: "0.15em",
            color: "rgba(244,244,245,0.14)",
            fontFamily: "monospace", textTransform: "uppercase",
            marginBottom: 8,
          }}>
            {certificate.verificationCode.slice(0, 20)}
          </div>

          {/* Disclaimer */}
          <div style={{
            fontSize: 7, letterSpacing: "0.08em",
            color: "rgba(244,244,245,0.18)",
            fontStyle: "italic", textAlign: "center",
          }}>
            This is a digitally generated certificate and does not require any signature
          </div>

        </div>
        {/* end content */}
      </div>
      {/* end rotated wrapper */}
    </div>
  )
}
