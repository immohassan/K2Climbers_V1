"use client"

import { motion, useInView } from "framer-motion"
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
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 1600
    const steps = 50
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export function StatsSection() {
  return (
    <section className="py-10 md:py-14 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="bg-background px-6 py-8 md:px-10 md:py-10"
            >
              <div className={`text-4xl md:text-5xl font-black tracking-tight mb-1 tabular-nums ${stat.accent}`}>
                <CountUp target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-base font-bold text-foreground">{stat.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5 tracking-wide">{stat.sublabel}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
