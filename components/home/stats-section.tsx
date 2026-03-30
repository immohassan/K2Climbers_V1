"use client"

import { useRef, useEffect, useState } from "react"

const stats = [
  { value: 150, suffix: "+", label: "Peaks", sublabel: "Conquered", accent: "text-orange-500" },
  { value: 2500, suffix: "+", label: "Climbers", sublabel: "Active Community", accent: "text-foreground" },
  { value: 85, suffix: "%", label: "Success", sublabel: "Summit Rate", accent: "text-summit" },
  { value: 100, suffix: "+", label: "Expeditions", sublabel: "Completed", accent: "text-orange-400" },
]

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        observer.disconnect()

        const duration = 1200
        const start = performance.now()
        const animate = (now: number) => {
          const elapsed = now - start
          const progress = Math.min(elapsed / duration, 1)
          // ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(eased * target))
          if (progress < 1) requestAnimationFrame(animate)
          else setCount(target)
        }
        requestAnimationFrame(animate)
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export function StatsSection() {
  return (
    <section className="py-10 md:py-14 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-background px-6 py-8 md:px-10 md:py-10"
            >
              <div className={`text-4xl md:text-5xl font-black tracking-tight mb-1 tabular-nums ${stat.accent}`}>
                <CountUp target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-base font-bold text-foreground">{stat.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5 tracking-wide">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
