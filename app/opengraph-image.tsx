import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          fontFamily: "sans-serif",
        }}
      >
        {/* Mountain icon */}
        <svg
          width="100"
          height="100"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f97316"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
        </svg>

        {/* Brand name */}
        <div style={{ fontSize: 72, fontWeight: 900, color: "#ffffff", letterSpacing: "-2px" }}>
          K2 Climbers
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 28, color: "#f97316", fontWeight: 700, letterSpacing: "4px", textTransform: "uppercase" }}>
          Pakistan Mountain Expeditions
        </div>
      </div>
    ),
    { ...size }
  )
}
