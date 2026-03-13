"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Mountain, Wind, Thermometer } from "lucide-react"
import Link from "next/link"
import { useRef } from "react"

const HERO_IMAGE = "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&q=90"

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] })
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    // h-[calc(100dvh-4rem)] → exactly fills viewport minus the 64px fixed navbar
    <section
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ height: "calc(100vh - 4rem)", minHeight: 480, maxHeight: 800 }}
    >
      {/* Parallax background */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div
          className="absolute inset-0 w-full h-[115%] -top-[5%] bg-cover bg-center"
          style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
        />
        {/* Left-heavy cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      </motion.div>

      {/* Main content — top info strip + bottom text, space-between */}
      <motion.div style={{ opacity }} className="relative z-10 h-full flex flex-col justify-between">
        {/* Info strip at very top of section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.7 }}
          className="border-b border-white/10 shrink-0"
        >
          <div className="container mx-auto px-4 sm:px-8 py-2.5 flex items-center gap-5 text-[10px] text-white/35 font-mono tracking-widest uppercase">
            <span className="flex items-center gap-1.5">
              <Mountain className="h-2.5 w-2.5" /> 8,611m — K2
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Wind className="h-2.5 w-2.5" /> Karakoram Range
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <Thermometer className="h-2.5 w-2.5" /> Pakistan · Gilgit-Baltistan
            </span>
            <span className="ml-auto hidden sm:block text-white/15">35°52′N · 76°30′E</span>
          </div>
        </motion.div>

        {/* Bottom content */}
        <div className="container mx-auto px-4 sm:px-8 pb-10 sm:pb-12 md:pb-14">

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-white/50 text-[11px] sm:text-xs font-mono tracking-[0.25em] uppercase mb-3 sm:mb-4"
          >
            Pakistan&apos;s Premier Mountaineering Company
          </motion.p>

          {/* Headline + side column */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8 mb-6 sm:mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="text-[clamp(2.8rem,9vw,7rem)] font-black text-white leading-[0.85] tracking-tighter"
            >
              CLIMB<br />
              <em className="not-italic text-white/20">the</em><br />
              WORLD
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.7 }}
              className="sm:pb-2 sm:border-l sm:border-white/15 sm:pl-6 max-w-[280px]"
            >
              <p className="text-white/55 text-xs sm:text-sm leading-relaxed mb-5">
                Expert-guided expeditions to Pakistan&apos;s highest peaks. Every route. Every season.
              </p>
              <Link href="/expeditions">
                <motion.div
                  whileHover={{ x: 4 }}
                  className="inline-flex items-center gap-3 group cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-orange-400 group-hover:text-orange-300 transition-colors">Explore Expeditions</span>
                  <div className="w-6 h-px bg-orange-400/60 group-hover:w-10 transition-all duration-300" />
                  <ArrowRight className="h-3.5 w-3.5 text-orange-400/70" />
                </motion.div>
              </Link>
            </motion.div>
          </div>

          {/* Peak data strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex items-center gap-0 overflow-x-auto no-scrollbar"
          >
            {[
              { peak: "K2", alt: "8,611m" },
              { peak: "Nanga Parbat", alt: "8,126m" },
              { peak: "Broad Peak", alt: "8,051m" },
              { peak: "Rakaposhi", alt: "7,788m" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 shrink-0 pl-4 pr-4 border-l border-white/10 first:border-0 first:pl-0">
                <div>
                  <div className="text-white text-[11px] font-bold whitespace-nowrap">{item.peak}</div>
                  <div className="text-white/30 text-[9px] font-mono whitespace-nowrap">{item.alt}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom page fade — tall enough to fully bleed into bg */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 z-20 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 100%)" }}
      />
    </section>
  )
}
