"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { getEmbedUrl } from "@/lib/video-utils"

const EASE = [0.16, 1, 0.3, 1] as const

export function HomeVideoSection() {
  const [embedData, setEmbedData] = useState<{
    src: string
    type: string
  } | null>(null)

  useEffect(() => {
    fetch("/api/settings/home-video")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d?.videoUrl?.trim()) return
        const embed = getEmbedUrl(d.videoUrl)
        if (!embed) return
        const src =
          embed.type === "youtube" || embed.type === "vimeo"
            ? `${embed.src}${embed.src.includes("?") ? "&" : "?"}autoplay=1&mute=1`
            : embed.src
        setEmbedData({ src, type: embed.type })
      })
      .catch(() => {})
  }, [])

  if (!embedData) return null

  return (
    <section className="py-14 md:py-20 bg-background border-b border-border overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Label + title */}
        <motion.div
          className="flex items-center justify-between mb-8 md:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-summit" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">Watch</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none">
              Tribute to<br />Our Heroes
            </h2>
          </div>
          <p className="hidden md:block text-sm text-muted-foreground max-w-[220px] text-right leading-relaxed">
            For every climber who reached the summit — and those who gave everything trying.
          </p>
        </motion.div>

        {/* Video */}
        <motion.div
          className="relative overflow-hidden border border-border"
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.75, ease: EASE }}
        >
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            {embedData.type === "youtube" || embedData.type === "vimeo" ? (
              <iframe
                src={embedData.src}
                title="K2 Climbers — tribute video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <video
                src={embedData.src}
                autoPlay
                muted
                loop
                playsInline
                controls
                className="absolute inset-0 h-full w-full object-contain bg-black"
                preload="auto"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </motion.div>

      </div>
    </section>
  )
}
