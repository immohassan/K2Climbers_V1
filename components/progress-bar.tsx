"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const barRef = useRef<HTMLDivElement>(null)
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedRef = useRef(false)

  function startBar() {
    const bar = barRef.current
    if (!bar) return
    startedRef.current = true
    if (completeTimer.current) clearTimeout(completeTimer.current)
    bar.style.transition = "none"
    bar.style.width = "0%"
    bar.style.opacity = "1"
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.transition = "width 8000ms cubic-bezier(0.05, 0.8, 0.2, 1)"
        bar.style.width = "85%"
      })
    })
  }

  function completeBar() {
    const bar = barRef.current
    if (!bar || !startedRef.current) return
    startedRef.current = false
    if (completeTimer.current) clearTimeout(completeTimer.current)
    bar.style.transition = "width 150ms ease"
    bar.style.width = "100%"
    completeTimer.current = setTimeout(() => {
      bar.style.transition = "opacity 250ms ease"
      bar.style.opacity = "0"
    }, 150)
  }

  // Start bar on link click — fires before navigation begins
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a")
      if (!target) return
      const href = target.getAttribute("href")
      if (!href) return
      // Ignore external links, hash-only, mailto, tel
      if (
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.target === "_blank"
      ) return
      startBar()
    }

    function handlePopState() {
      startBar()
    }

    document.addEventListener("click", handleClick, true)
    window.addEventListener("popstate", handlePopState)
    return () => {
      document.removeEventListener("click", handleClick, true)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [])

  // Complete bar when the new page has actually rendered
  useEffect(() => {
    completeBar()
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
