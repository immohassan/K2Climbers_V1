"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

// Lightweight CSS-only progress bar — no external CSS import, no third-party bundle
export function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const barRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    // Start: slide bar to 80% quickly
    bar.style.transition = "none"
    bar.style.width = "0%"
    bar.style.opacity = "1"
    // Force reflow in a rAF to avoid batching with the reset
    requestAnimationFrame(() => {
      bar.style.transition = "width 300ms ease"
      bar.style.width = "80%"
    })

    // Complete: fill to 100% then fade out
    timerRef.current = setTimeout(() => {
      bar.style.transition = "width 200ms ease"
      bar.style.width = "100%"
      setTimeout(() => {
        bar.style.transition = "opacity 300ms ease"
        bar.style.opacity = "0"
      }, 200)
    }, 250)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pathname, searchParams])

  return (
    <div
      ref={barRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "2px",
        width: "0%",
        opacity: "0",
        background: "#f97316",
        zIndex: 9999,
        pointerEvents: "none",
        boxShadow: "0 0 8px #f97316",
      }}
    />
  )
}
