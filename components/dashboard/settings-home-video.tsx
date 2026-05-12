"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"

export function SettingsHomeVideo() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")

  useEffect(() => {
    fetch("/api/settings/home-video")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load"))))
      .then((data) => setVideoUrl(data.videoUrl || ""))
      .catch(() => toast.error("Failed to load home video"))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings/home-video", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: videoUrl.trim() || null }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success("Home page video saved")
      router.refresh()
    } catch {
      toast.error("Failed to save home video")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Home Page Video</CardTitle>
        <CardDescription>
          Video shown below the About Us section. YouTube, Vimeo, or direct video link. Leave empty to hide the section.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="home-video-url">Video URL</Label>
          <Input
            id="home-video-url"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... or Vimeo / direct MP4 link"
          />
        </div>
        <Button onClick={handleSave} variant="summit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save Home Video"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
