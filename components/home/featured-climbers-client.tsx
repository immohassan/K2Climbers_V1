"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mountain, Award, ArrowUpRight } from "lucide-react"

interface Climber {
  id: string
  name: string | null
  image: string | null
  summitCount: number
  _count?: { summitRecords: number }
  certificates?: Array<unknown>
}

export function FeaturedClimbersClient({ climbers }: { climbers: Climber[] }) {
  if (climbers.length === 0) return null

  return (
    <section className="py-14 md:py-20 bg-card/30 border-b border-border">
      <div className="container mx-auto px-4">

        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-glacier-400" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">Community</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none">
              Our<br className="hidden sm:block" /> Climbers
            </h2>
          </div>
          <Link
            href="/climbers"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            View all
            <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid gap-px bg-border grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {climbers.map((climber, index) => (
            <motion.div
              key={climber.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.4 }}
              className="bg-background"
            >
              <Link href={`/climbers/${climber.id}`}>
                <div className="flex items-center gap-4 px-5 py-4 group hover:bg-card/60 transition-colors cursor-pointer">
                  {/* Index */}
                  <span className="text-xs font-black text-border w-4 shrink-0 select-none">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <Avatar className="h-11 w-11 shrink-0 rounded-none border border-border">
                    <AvatarImage src={climber.image || undefined} className="object-cover" />
                    <AvatarFallback className="rounded-none text-sm font-black bg-muted">
                      {climber.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate group-hover:text-summit transition-colors">
                      {climber.name || "Anonymous Climber"}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mountain className="h-3 w-3" />
                        {climber.summitCount} summits
                      </span>
                      {(climber.certificates?.length ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {climber.certificates!.length} certs
                        </span>
                      )}
                    </div>
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-border group-hover:text-summit group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
