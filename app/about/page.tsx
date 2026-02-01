import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getAboutUsData, getTestimonials } from "@/lib/settings"
import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AboutPage() {
  const [data, testimonials] = await Promise.all([
    getAboutUsData(),
    getTestimonials(),
  ])
  const hasFounderImages =
    data.founder1Image || data.founder2Image || data.founder3Image

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 pb-12">
        <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
          <h1 className="mb-10 text-center text-3xl font-bold sm:text-4xl md:text-5xl">
            About Us
          </h1>
          <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-16 lg:gap-20">
            <div className="min-w-0 space-y-6 md:flex md:flex-col md:justify-center">
              <p className="whitespace-pre-line text-base leading-relaxed text-muted-foreground sm:text-lg">
                {data.text}
              </p>
            </div>
            {hasFounderImages && (
              <div className="grid min-w-0 grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {[data.founder1Image, data.founder2Image, data.founder3Image].map(
                  (src, i) => {
                    const name =
                      [data.founder1Name, data.founder2Name, data.founder3Name][i]
                    if (!src) {
                      return (
                        <div
                          key={i}
                          className="aspect-square rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30"
                          aria-hidden
                        />
                      )
                    }
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-3 text-center"
                      >
                        <div className="relative aspect-square w-full min-w-0 overflow-hidden rounded-xl border border-border bg-muted">
                          <Image
                            src={src}
                            alt={name || `Founder ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 240px"
                          />
                        </div>
                        {name && (
                          <span className="text-sm font-medium sm:text-base">
                            {name}
                          </span>
                        )}
                      </div>
                    )
                  }
                )}
              </div>
            )}
          </div>

          {/* Our Mission */}
          <section className="mx-auto mt-20 max-w-4xl border-t border-border pt-16">
            <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
              Our Mission
            </h2>
            <p className="whitespace-pre-line text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
              {data.mission}
            </p>
          </section>

          {/* Testimonials */}
          {testimonials.length > 0 && (
            <section className="mx-auto mt-20 max-w-5xl border-t border-border pt-16">
              <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
                Testimonials
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((t) => (
                  <Card key={t.id} className="flex flex-col overflow-hidden">
                    <CardContent className="flex flex-1 flex-col p-6">
                      <Quote className="mb-3 h-8 w-8 text-glacier-500/70" />
                      <p className="flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        &ldquo;{t.content}&rdquo;
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        {t.imageUrl && (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                            <Image
                              src={t.imageUrl}
                              alt={t.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{t.name}</p>
                          {t.role && (
                            <p className="text-xs text-muted-foreground sm:text-sm">
                              {t.role}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
