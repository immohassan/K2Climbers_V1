"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import toast from "react-hot-toast"
import { Loader2, Plus, Trash2 } from "lucide-react"
import Image from "next/image"

type Testimonial = {
  id: string
  name: string
  role: string | null
  content: string
  imageUrl: string | null
  order: number
}

export function SettingsTestimonials() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [list, setList] = useState<Testimonial[]>([])
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const load = () => {
    fetch("/api/testimonials")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load"))))
      .then(setList)
      .catch(() => toast.error("Failed to load testimonials"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith("image/")) {
      toast.error("Please select an image")
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const { url } = await res.json()
      setImageUrl(url)
      toast.success("Image uploaded")
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !content.trim()) {
      toast.error("Name and content are required")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          role: role.trim() || null,
          content: content.trim(),
          imageUrl: imageUrl.trim() || null,
          order: list.length,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to add")
      }
      toast.success("Testimonial added")
      setName("")
      setRole("")
      setContent("")
      setImageUrl("")
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Testimonial deleted")
      load()
    } catch {
      toast.error("Failed to delete")
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
        <CardTitle>Testimonials</CardTitle>
        <CardDescription>
          Testimonials shown on the About Us page. Add name, optional role, content, and optional photo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleAdd} className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
          <h3 className="font-medium">Add testimonial</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="t-name">Name *</Label>
              <Input
                id="t-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-role">Role (optional)</Label>
              <Input
                id="t-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Adventurer, Expedition Leader"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="t-content">Content *</Label>
            <Textarea
              id="t-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="What they said..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Photo (optional)</Label>
            <Input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleImageUpload}
              className="cursor-pointer text-sm"
            />
            {imageUrl && (
              <div className="relative mt-2 h-16 w-16 overflow-hidden rounded-full border border-border">
                <Image src={imageUrl} alt="Preview" fill className="object-cover" sizes="64px" />
              </div>
            )}
          </div>
          <Button type="submit" variant="summit" size="sm" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Testimonial
              </>
            )}
          </Button>
        </form>

        {list.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Current testimonials</h3>
            <ul className="space-y-3">
              {list.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{t.name}</p>
                    {t.role && (
                      <p className="text-xs text-muted-foreground sm:text-sm">{t.role}</p>
                    )}
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      &ldquo;{t.content}&rdquo;
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(t.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
