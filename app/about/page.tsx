import type { Metadata } from "next"
import Image from "next/image"
import { Footer } from "@/components/footer"
import { getAboutUsData } from "@/lib/settings"
import { GoogleReviewsSection } from "@/components/home/google-reviews-section"

export const revalidate = 3600 // 1h ISR safety net; tag revalidation handles real updates

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
  const data = await getAboutUsData()
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

        </div>

        {/* Reviews — same Google reviews shown on the home page */}
        <GoogleReviewsSection />
      </main>
      <Footer />
    </>
  )
}
