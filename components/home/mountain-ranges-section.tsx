"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight, Mountain } from "lucide-react"

const RANGES = [
  {
    key: "KARAKORAM",
    name: "Karakoram",
    subtitle: "Home of K2 & the Giants",
    description:
      "The Karakoram range harbours four of the world's fourteen 8,000m peaks — including K2, the world's second-highest and most formidable summit. A realm of sheer ice walls, vast glaciers and extreme altitude.",
    peaks: ["K2 — 8,611m", "Gasherbrum I — 8,080m", "Broad Peak — 8,051m", "Gasherbrum II — 8,034m"],
    accent: "from-orange-500/20 to-transparent",
    border: "border-orange-500/20 hover:border-orange-500/60",
    label: "text-orange-500",
    stat: "4 × 8000m peaks",
  },
  {
    key: "HIMALAYA",
    name: "Himalaya",
    subtitle: "Roof of the World",
    description:
      "The great Himalayan arc stretches across five nations and contains the highest points on Earth. Nanga Parbat — the ninth highest peak and one of the deadliest — crowns Pakistan's share of this legendary range.",
    peaks: ["Nanga Parbat — 8,126m", "Rakaposhi — 7,788m", "Haramosh — 7,409m", "Malubiting — 7,458m"],
    accent: "from-blue-500/20 to-transparent",
    border: "border-blue-500/20 hover:border-blue-500/60",
    label: "text-blue-400",
    stat: "Highest on Earth",
  },
  {
    key: "HINDU_KUSH",
    name: "Hindu Kush",
    subtitle: "Wild & Untamed West",
    description:
      "The Hindu Kush stretches 800 km through northern Pakistan and Afghanistan. Remote, rugged and rarely visited, it offers genuine wilderness mountaineering for those seeking a raw and uncrowded adventure.",
    peaks: ["Tirich Mir — 7,708m", "Noshaq — 7,492m", "Istoro Nal — 7,403m", "Saraghrar — 7,349m"],
    accent: "from-green-500/20 to-transparent",
    border: "border-green-500/20 hover:border-green-500/60",
    label: "text-green-500",
    stat: "800km of wilderness",
  },
]

export function MountainRangesSection() {
  return (
    <section className="py-16 md:py-24 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 md:mb-16"
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-3">Explore by Range</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Mountain Ranges
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm sm:text-base">
            Pakistan is home to three of the world&apos;s greatest mountain ranges. Choose your arena.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-px bg-border">
          {RANGES.map((range, i) => (
            <motion.div
              key={range.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={`/expeditions?range=${range.key}`}
                className={`group flex flex-col h-full bg-background border-0 transition-colors ${range.border} relative overflow-hidden`}
              >
                {/* Gradient accent */}
                <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${range.accent} pointer-events-none`} />

                <div className="relative p-6 sm:p-7 flex flex-col h-full">
                  {/* Range name */}
                  <div className="mb-5">
                    <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-2 ${range.label}`}>
                      {range.stat}
                    </p>
                    <h3 className="text-2xl font-black tracking-tight group-hover:text-orange-500 transition-colors">
                      {range.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{range.subtitle}</p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                    {range.description}
                  </p>

                  {/* Notable peaks */}
                  <div className="space-y-1.5 mb-6">
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2">
                      Notable Peaks
                    </p>
                    {range.peaks.map((peak) => (
                      <div key={peak} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mountain className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                        {peak}
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className={`flex items-center gap-2 text-xs font-bold ${range.label} group-hover:gap-3 transition-all`}>
                    View Expeditions
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
