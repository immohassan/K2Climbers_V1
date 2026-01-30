"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play } from "lucide-react"

function getEmbedUrl(url: string): { type: "youtube" | "vimeo" | "direct"; src: string } | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  // YouTube: watch, youtu.be, embed
  const youtubeWatch = trimmed.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/)
  if (youtubeWatch) {
    return { type: "youtube", src: `https://www.youtube.com/embed/${youtubeWatch[1]}` }
  }
  const youtubeShort = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (youtubeShort) {
    return { type: "youtube", src: `https://www.youtube.com/embed/${youtubeShort[1]}` }
  }
  if (trimmed.includes("youtube.com/embed/")) {
    return { type: "youtube", src: trimmed }
  }

  // Vimeo: vimeo.com/123456 or player.vimeo.com/video/123456
  const vimeo = trimmed.match(/(?:vimeo\.com\/)(?:video\/)?(\d+)/)
  if (vimeo) {
    return { type: "vimeo", src: `https://player.vimeo.com/video/${vimeo[1]}` }
  }
  if (trimmed.includes("player.vimeo.com/video/")) {
    return { type: "vimeo", src: trimmed }
  }

  // Direct video URL
  const lower = trimmed.toLowerCase()
  if (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".ogg") ||
    lower.includes(".mp4?") ||
    lower.includes("video/")
  ) {
    return { type: "direct", src: trimmed }
  }

  return null
}

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
