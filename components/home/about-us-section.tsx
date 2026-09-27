import Image from "next/image"
import { getAboutUsData } from "@/lib/settings"

export async function AboutUsSection() {
  const data = await getAboutUsData()
  const founderImages = [data.founder1Image, data.founder2Image, data.founder3Image]
  const founderNames = [data.founder1Name, data.founder2Name, data.founder3Name]
  const hasFounderImages = founderImages.some(Boolean)

  return (
    <section className="pt-20 pb-24 md:pt-28 md:pb-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4">

        <div className="flex items-center gap-2 mb-8 md:mb-12">
          <span className="h-px w-6 bg-accentBrand" aria-hidden />
          <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-muted-foreground">Our Story</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">

          {/* Text column */}
          <div className="bg-background pr-0 md:pr-12 lg:pr-20 py-0 pb-8 md:pb-0">
            <h2 className="font-display text-display-md md:text-display-lg font-semibold mb-6 md:mb-8">
              Twenty years of<br />
              Pakistani mountains.
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base whitespace-pre-line max-w-prose">
              {data.text}
            </p>
          </div>

          {/* Founders column */}
          {hasFounderImages ? (
            <div className="bg-background pl-0 md:pl-12 lg:pl-20 pt-8 md:pt-0">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {founderImages.map((src, i) => {
                  const name = founderNames[i]
                  if (!src) return (
                    <div
                      key={i}
                      className="aspect-[2/3] bg-muted/30 border border-dashed border-border"
                      aria-hidden
                    />
                  )
                  return (
                    <div key={i} className="relative group">
                      <div className="aspect-[2/3] relative overflow-hidden bg-muted">
                        <Image
                          src={src}
                          alt={name || `Founder ${i + 1}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 33vw, 180px"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        {name && (
                          <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] sm:text-xs font-bold text-white/80 px-1 leading-tight">
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
            <div className="bg-background pl-0 md:pl-12 lg:pl-20 pt-8 md:pt-0 flex items-center">
              <blockquote className="border-l-2 border-summit pl-5">
                <p className="text-xl sm:text-2xl font-semibold leading-tight text-foreground/80 italic">
                  &quot;The mountains are calling and I must go.&quot;
                </p>
                <cite className="text-xs text-muted-foreground mt-3 block not-italic tracking-widest uppercase">
                  — John Muir
                </cite>
              </blockquote>
            </div>
          )}
        </div>

      </div>
    </section>
  )
}
