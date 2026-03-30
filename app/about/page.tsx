import type { Metadata } from "next"
import Image from "next/image"
import { Footer } from "@/components/footer"
import { getAboutUsData, getTestimonials } from "@/lib/settings"
import { Quote, Mountain } from "lucide-react"

export const revalidate = 86400 // revalidate every 24 hours

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about K2 Climbers — Pakistan's premier mountaineering and adventure travel company. Expert guides, safe expeditions, and a passion for Pakistan's greatest peaks.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About K2 Climbers",
    description:
      "Pakistan's premier mountaineering and adventure travel company. Expert guides, safe expeditions, and a passion for Pakistan's greatest peaks.",
    url: "/about",
  },
}

export default async function AboutPage() {
  const [data, testimonials] = await Promise.all([
    getAboutUsData(),
    getTestimonials(),
  ])
  const founderImages = [data.founder1Image, data.founder2Image, data.founder3Image]
  const founderNames = [data.founder1Name, data.founder2Name, data.founder3Name]
  const hasFounderImages = founderImages.some(Boolean)

  return (
    <>
      <main className="min-h-screen pt-16">
        <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 max-w-5xl">

          {/* Header */}
          <div className="mb-12 md:mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-3">About Us</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              About K2 Climbers
            </h1>
          </div>

          {/* Story + Founders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-16 md:mb-20">
            <div>
              <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
                {data.text}
              </p>
            </div>

            {hasFounderImages ? (
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-5">Our Founders</p>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {founderImages.map((src, i) => {
                    const name = founderNames[i]
                    if (!src) return (
                      <div
                        key={i}
                        className="aspect-[2/3] bg-muted/30 border border-dashed border-border rounded-sm"
                        aria-hidden
                      />
                    )
                    return (
                      <div key={i} className="relative group">
                        <div className="aspect-[2/3] relative overflow-hidden rounded-sm bg-muted">
                          <Image
                            src={src}
                            alt={name || `Founder ${i + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 33vw, 200px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          {name && (
                            <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] sm:text-xs font-semibold text-white/90 px-1 leading-tight">
                              {name}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <blockquote className="border-l-2 border-orange-500/40 pl-5">
                  <p className="text-lg sm:text-xl font-semibold leading-snug text-foreground/70 italic">
                    &quot;The mountains are calling and I must go.&quot;
                  </p>
                  <cite className="text-xs text-muted-foreground mt-3 block not-italic tracking-wider uppercase">
                    — John Muir
                  </cite>
                </blockquote>
              </div>
            )}
          </div>

          {/* Mission */}
          {data.mission && (
            <div className="border-t border-border pt-12 md:pt-16 mb-16 md:mb-20">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-4">Our Mission</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-foreground">
                  Why We Climb
                </h2>
                <p className="text-muted-foreground leading-relaxed text-base whitespace-pre-line">
                  {data.mission}
                </p>
              </div>
            </div>
          )}

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <div className="border-t border-border pt-12 md:pt-16">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-8">What Climbers Say</p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((t) => (
                  <div key={t.id} className="flex flex-col gap-4 p-5 bg-card rounded-sm border border-border">
                    <Quote className="h-4 w-4 text-orange-500/50 shrink-0" />
                    <p className="text-sm leading-relaxed text-muted-foreground flex-1">
                      &ldquo;{t.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t border-border">
                      {t.imageUrl ? (
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                          <Image src={t.imageUrl} alt={t.name} fill className="object-cover" sizes="32px" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 shrink-0 rounded-full border border-border bg-muted flex items-center justify-center">
                          <Mountain className="h-3.5 w-3.5 text-muted-foreground/40" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}
