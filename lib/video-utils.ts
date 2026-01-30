export function getEmbedUrl(
  url: string
): { type: "youtube" | "vimeo" | "direct"; src: string } | null {
  const trimmed = url.trim()
  if (!trimmed) return null

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

  const vimeo = trimmed.match(/(?:vimeo\.com\/)(?:video\/)?(\d+)/)
  if (vimeo) {
    return { type: "vimeo", src: `https://player.vimeo.com/video/${vimeo[1]}` }
  }
  if (trimmed.includes("player.vimeo.com/video/")) {
    return { type: "vimeo", src: trimmed }
  }

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
