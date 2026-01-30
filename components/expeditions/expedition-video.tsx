"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play } from "lucide-react"
import { getEmbedUrl } from "@/lib/video-utils"

export function ExpeditionVideo({ videoUrl }: { videoUrl: string | null }) {
  if (!videoUrl?.trim()) {
    return null
  }

  const embed = getEmbedUrl(videoUrl)
  if (!embed) {
    return null
  }

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
          <Play className="h-5 w-5 shrink-0 text-glacier-500" />
          Expedition Video
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="relative w-full overflow-hidden rounded-lg border border-border bg-muted/30">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            {embed.type === "youtube" || embed.type === "vimeo" ? (
              <iframe
                src={embed.src}
                title="Expedition video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <video
                src={embed.src}
                controls
                playsInline
                className="absolute inset-0 h-full w-full object-contain"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
