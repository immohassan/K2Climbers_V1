import Image from "next/image"
import { getAboutUsData } from "@/lib/settings"

export async function AboutUsSection() {
  const data = await getAboutUsData()
  const hasFounderImages =
    data.founder1Image || data.founder2Image || data.founder3Image

  return (
    <section className="bg-card/50 py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl md:text-4xl">
          About Us
        </h2>
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
          <div className="min-w-0 space-y-4 md:flex md:flex-col md:justify-center">
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
              {data.text}
            </p>
          </div>
          {hasFounderImages && (
            <div className="grid min-w-0 grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {[data.founder1Image, data.founder2Image, data.founder3Image].map(
                (src, i) => {
                  const name =
                    [data.founder1Name, data.founder2Name, data.founder3Name][i]
                  if (!src) {
                    return (
                      <div
                        key={i}
                        className="aspect-square rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30"
                        aria-hidden
                      />
                    )
                  }
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-2 text-center"
                    >
                      <div className="relative aspect-square w-full min-w-0 overflow-hidden rounded-lg border border-border bg-muted">
                        <Image
                          src={src}
                          alt={name || `Founder ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 200px"
                        />
                      </div>
                      {name && (
                        <span className="text-xs font-medium sm:text-sm">
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
      </div>
    </section>
  )
}
