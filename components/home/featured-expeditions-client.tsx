"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mountain, MapPin, Calendar, Users, ArrowRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Expedition {
  id: string
  title: string
  slug: string
  shortDescription: string | null
  description: string
  altitude: number
  duration: number
  location: string
  basePrice: number
  heroImage: string | null
  successRate: number | null
  guides: Array<{
    name: string | null
    image: string | null
  }>
}

export function FeaturedExpeditionsClient({ expeditions }: { expeditions: Expedition[] }) {
  if (expeditions.length === 0) {
    return (
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Featured Expeditions</h2>
          <p className="text-center text-muted-foreground">No expeditions available yet. Check back soon!</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Expeditions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular mountaineering adventures
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {expeditions.map((expedition, index) => (
            <motion.div
              key={expedition.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                {expedition.heroImage && (
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${expedition.heroImage})` }}
                  />
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{expedition.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {expedition.shortDescription || expedition.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Mountain className="h-4 w-4 mr-2" />
                      {expedition.altitude}m
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {expedition.duration} days
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {expedition.location}
                    </div>
                    {expedition.successRate && (
                      <div className="flex items-center text-glacier-400">
                        <Users className="h-4 w-4 mr-2" />
                        {expedition.successRate}% success rate
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-2xl font-bold">
                  {formatCurrency(expedition.basePrice)}
                  </div>
                  <Link href={`/expeditions/${expedition.slug}`}>
                    <Button variant="summit">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/expeditions">
            <Button variant="outline" size="lg">
              View All Expeditions
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
