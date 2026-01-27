"use client"

import { motion } from "framer-motion"
import { Mountain, Users, Award, TrendingUp } from "lucide-react"

const stats = [
  { icon: Mountain, value: "150+", label: "Peaks Conquered", color: "text-glacier-400" },
  { icon: Users, value: "2,500+", label: "Active Climbers", color: "text-summit" },
  { icon: Award, value: "85%", label: "Success Rate", color: "text-glacier-300" },
  { icon: TrendingUp, value: "100+", label: "Expeditions", color: "text-summit-600" },
]

export function StatsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-card border border-border">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
