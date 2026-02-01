"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"
import Image from "next/image"

const DEFAULT_TEXT =
  "The company's expertise lies in Road tours, treks, Hiking, Climbing and also expedition assistance in Gilgit Baltistan KPK & In Kashmir Pakistan.\n\nOur company is equally involved in tourism-related activities throughout Pakistan with the same volume.\n\nWe have team from young minds to experienced team members, the company understands the strengths, weaknesses and most importantly the potential-for-improvement of tourism industry in Pakistan."

const DEFAULT_MISSION =
  "We Want to create an enabling environment for Pakistan's tourism industry by providing facilities that commensurate with our rich cultural heritage, rare archaeological treasures and exquisite environmental beauty.\n\nWe want to Project Pakistan as a tourist friendly destination."

export function SettingsAboutUs() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<number | null>(null)
  const [text, setText] = useState(DEFAULT_TEXT)
  const [mission, setMission] = useState(DEFAULT_MISSION)
  const [founder1Image, setFounder1Image] = useState<string | null>(null)
  const [founder2Image, setFounder2Image] = useState<string | null>(null)
  const [founder3Image, setFounder3Image] = useState<string | null>(null)
  const [founder1Name, setFounder1Name] = useState("")
  const [founder2Name, setFounder2Name] = useState("")
  const [founder3Name, setFounder3Name] = useState("")

  useEffect(() => {
    fetch("/api/settings/about-us")
      .then((res) => res.ok ? res.json() : Promise.reject(new Error("Failed to load")))
      .then((data) => {
        setText(data.text || DEFAULT_TEXT)
        setMission(data.mission || DEFAULT_MISSION)
        setFounder1Image(data.founder1Image || null)
        setFounder2Image(data.founder2Image || null)
        setFounder3Image(data.founder3Image || null)
        setFounder1Name(data.founder1Name || "")
        setFounder2Name(data.founder2Name || "")
        setFounder3Name(data.founder3Name || "")
      })
      .catch(() => toast.error("Failed to load About Us settings"))
      .finally(() => setLoading(false))
  }, [])

  const handleImageUpload = async (index: 1 | 2 | 3, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Image must be under 20MB")
      return
    }
    setUploading(index)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Upload failed")
      }
      const { url } = await res.json()
      if (index === 1) setFounder1Image(url)
      if (index === 2) setFounder2Image(url)
      if (index === 3) setFounder3Image(url)
      toast.success("Image uploaded (saved in database)")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(null)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings/about-us", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          mission,
          founder1Image,
          founder2Image,
          founder3Image,
          founder1Name,
          founder2Name,
          founder3Name,
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success("About Us saved")
    } catch {
      toast.error("Failed to save About Us")
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
        <CardTitle>About Us</CardTitle>
        <CardDescription>
          Paragraph and 3 founder images shown on the home page. Images are stored in the database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="about-text">About Us paragraph</Label>
          <Textarea
            id="about-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="resize-y"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mission-text">Our Mission (About page)</Label>
          <Textarea
            id="mission-text"
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            rows={4}
            className="resize-y"
            placeholder="Mission statement shown on About Us page"
          />
        </div>

        <div className="space-y-4">
          <Label>Founder images (3)</Label>
          <div className="grid gap-6 sm:grid-cols-3">
            {([1, 2, 3] as const).map((i) => {
              const url = i === 1 ? founder1Image : i === 2 ? founder2Image : founder3Image
              const setName = i === 1 ? setFounder1Name : i === 2 ? setFounder2Name : setFounder3Name
              const name = i === 1 ? founder1Name : i === 2 ? founder2Name : founder3Name
              return (
                <div key={i} className="space-y-2">
                  <Label className="text-xs">Founder {i} name (optional)</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={`Founder ${i} name`}
                  />
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      disabled={uploading !== null}
                      className="cursor-pointer text-sm"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handleImageUpload(i, f)
                        e.target.value = ""
                      }}
                    />
                    {uploading === i && (
                      <p className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Uploading…
                      </p>
                    )}
                    {url && (
                      <div className="relative aspect-square w-full max-w-[160px] overflow-hidden rounded-lg border border-border bg-muted">
                        <Image
                          src={url}
                          alt={`Founder ${i}`}
                          fill
                          className="object-cover"
                          sizes="160px"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <Button onClick={handleSave} variant="summit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save About Us"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
