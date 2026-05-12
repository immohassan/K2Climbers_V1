"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const PHONE = "923416903128"
const MESSAGE = encodeURIComponent("Hi! I'm interested in your expeditions.")
const WA_URL = `https://wa.me/${PHONE}?text=${MESSAGE}`

export function WhatsAppWidget() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  // Defer render until after page is interactive to avoid TBT contribution
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 2500)
    return () => clearTimeout(id)
  }, [])

  if (
    !visible ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/auth") ||
    pathname?.endsWith("/print")
  ) {
    return null
  }

  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-2"
    >
      {/* Tooltip */}
      <span className="
        opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0
        transition-all duration-200 pointer-events-none
        bg-[#111] text-white text-xs font-semibold px-3 py-1.5
        border border-white/10 shadow-lg whitespace-nowrap
      ">
        Chat with us
      </span>

      {/* Button */}
      <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/30 hover:scale-110 transition-transform duration-200">
        {/* Pulse ring — delayed so it doesn't fire during LCP window */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 [animation-delay:3s]" />
        {/* WhatsApp SVG icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-7 h-7 relative z-10"
          fill="white"
          aria-hidden="true"
        >
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.651 4.823 1.786 6.845L2 30l7.353-1.768A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.55 11.55 0 0 1-5.894-1.613l-.422-.252-4.363 1.05 1.079-4.25-.277-.436A11.56 11.56 0 0 1 4.4 16C4.4 9.59 9.59 4.4 16 4.4S27.6 9.59 27.6 16 22.41 27.6 16 27.6zm6.33-8.67c-.347-.174-2.054-1.013-2.374-1.129-.319-.116-.551-.174-.783.174-.232.347-.899 1.129-1.102 1.362-.203.232-.406.26-.753.086-.347-.174-1.464-.54-2.788-1.72-1.03-.92-1.726-2.054-1.929-2.401-.203-.347-.022-.535.152-.708.157-.156.347-.406.521-.609.173-.203.231-.347.347-.579.115-.232.058-.435-.029-.609-.087-.173-.783-1.887-1.073-2.585-.283-.68-.57-.587-.783-.598l-.667-.012a1.28 1.28 0 0 0-.928.435c-.319.347-1.217 1.188-1.217 2.898 0 1.71 1.246 3.363 1.42 3.595.173.232 2.453 3.745 5.942 5.252.831.359 1.479.573 1.984.733.834.265 1.593.228 2.192.138.669-.1 2.054-.84 2.345-1.652.29-.812.29-1.508.203-1.652-.087-.145-.319-.232-.667-.406z" />
        </svg>
      </div>
    </a>
  )
}
