import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play } from "lucide-react"
import { getHomeVideoUrl } from "@/lib/settings"
import { getEmbedUrl } from "@/lib/video-utils"

export async function HomeVideoSection() {
  const videoUrl = await getHomeVideoUrl()
  if (!videoUrl?.trim()) return null

  const embed = getEmbedUrl(videoUrl)
  if (!embed) return null

  // Autoplay: browsers typically allow only when muted
  const embedSrcWithAutoplay =
    embed.type === "youtube" || embed.type === "vimeo"
      ? `${embed.src}${embed.src.includes("?") ? "&" : "?"}autoplay=1&mute=1`
      : embed.src

  return (
    <section className="border-t border-border bg-card/30 py-8 sm:py-12 md:py-16">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <Card className="min-w-0 overflow-hidden">
          <CardContent className="pt-0 sm:pt-0 p-0">
            <div className="relative w-full overflow-hidden rounded-lg border border-border bg-muted/30">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                {embed.type === "youtube" || embed.type === "vimeo" ? (
                  <iframe
                    src={embedSrcWithAutoplay}
                    title="Our expeditions and tours"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <video
                    src={embed.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="absolute inset-0 h-full w-full object-contain"
                    preload="auto"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
