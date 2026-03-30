import { getHomeVideoUrl } from "@/lib/settings"
import { getEmbedUrl } from "@/lib/video-utils"

export async function HomeVideoSection() {
  const videoUrl = await getHomeVideoUrl()
  if (!videoUrl?.trim()) return null

  const embed = getEmbedUrl(videoUrl)
  if (!embed) return null

  const src =
    embed.type === "youtube" || embed.type === "vimeo"
      ? `${embed.src}${embed.src.includes("?") ? "&" : "?"}autoplay=1&mute=1`
      : embed.src

  return (
    <section className="py-14 md:py-20 bg-background border-b border-border overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl">

        <div className="flex items-center justify-between mb-8 md:mb-10">
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
        </div>

        <div className="relative overflow-hidden border border-border">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            {embed.type === "youtube" || embed.type === "vimeo" ? (
              <iframe
                src={src}
                title="K2 Climbers — tribute video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <video
                src={src}
                autoPlay
                muted
                loop
                playsInline
                controls
                className="absolute inset-0 h-full w-full object-contain bg-black"
                preload="none"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}
