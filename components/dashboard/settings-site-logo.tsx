"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export function SettingsSiteLogo() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState("")

  useEffect(() => {
    fetch("/api/settings/logo")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setLogoUrl(data?.logoUrl || ""))
      .catch(() => toast.error("Failed to load logo"))
      .finally(() => setLoading(false))
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const { url } = await res.json()
      setLogoUrl(url)
      toast.success("Image uploaded (save to apply)")
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings/logo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: logoUrl.trim() || null }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success("Logo saved. Refresh the site to see it.")
    } catch {
      toast.error("Failed to save logo")
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
        <CardTitle>Site Logo</CardTitle>
        <CardDescription>
          Logo shown in the navbar and footer. Leave empty to use the default mountain icon.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="logo-url">Logo URL or upload</Label>
          <Input
            id="logo-url"
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://... or upload below"
          />
        </div>
        <div className="space-y-2">
          <Label>Upload image (saved in database)</Label>
          <Input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleImageUpload}
            className="cursor-pointer text-sm"
          />
          {uploading && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Uploading…
            </p>
          )}
        </div>
        {logoUrl && (
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-border bg-muted">
              <Image
                src={logoUrl}
                alt="Logo preview"
                fill
                className="object-contain"
                sizes="48px"
                unoptimized={logoUrl.startsWith("http")}
              />
            </div>
            <p className="text-xs text-muted-foreground">Current logo preview</p>
          </div>
        )}
        <Button onClick={handleSave} variant="summit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save Logo"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
