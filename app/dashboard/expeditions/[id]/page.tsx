"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"
import { slugify } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import { ExpeditionSlotsManager } from "@/components/dashboard/expedition-slots-manager"

interface ItineraryItem {
  dayNumber: number
  title: string
  description: string
  altitude?: number
  activities: string[]
}

interface RequiredGear {
  name: string
  quantity: number
  required: boolean
}

export default function EditExpeditionPage() {
  const router = useRouter()
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    shortDescription: "",
    category: "",
    difficulty: "",
    altitude: "",
    duration: "",
    basePrice: "",
    location: "",
    latitude: "",
    longitude: "",
    heroImage: "",
    videoUrl: "",
    maxGroupSize: "",
    minGroupSize: "1",
    successRate: "",
    metaTitle: "",
    metaDescription: "",
    requiredEquipment: "",
    paymentPolicy: "",
    refundPolicy: "",
    mountainRange: "",
    isActive: true,
    featured: false,
  })
  const [itineraries, setItineraries] = useState<ItineraryItem[]>([])
  const [requiredGear, setRequiredGear] = useState<RequiredGear[]>([])
  const [uploadingHero, setUploadingHero] = useState(false)

  const fetchExpedition = useCallback(async () => {
    try {
      const res = await fetch(`/api/expeditions/${id}`)
      if (res.ok) {
        const data = await res.json()
        setFormData({
          title: data.title || "",
          slug: data.slug || "",
          description: data.description || "",
          shortDescription: data.shortDescription || "",
          category: data.category || "",
          difficulty: data.difficulty || "",
          altitude: data.altitude?.toString() || "",
          duration: data.duration?.toString() || "",
          basePrice: data.basePrice?.toString() || "",
          location: data.location || "",
          latitude: data.latitude?.toString() ?? "",
          longitude: data.longitude?.toString() ?? "",
          heroImage: data.heroImage || "",
          videoUrl: data.videoUrl ?? "",
          maxGroupSize: data.maxGroupSize?.toString() || "",
          minGroupSize: data.minGroupSize?.toString() || "1",
          successRate: data.successRate?.toString() || "",
          metaTitle: data.metaTitle || "",
          metaDescription: data.metaDescription || "",
          requiredEquipment: data.requiredEquipment || "",
          paymentPolicy: data.paymentPolicy || "",
          refundPolicy: data.refundPolicy || "",
          mountainRange: data.mountainRange || "",
          isActive: data.isActive ?? true,
          featured: data.featured ?? false,
        })
        setItineraries(
          data.itineraries?.map((it: any) => ({
            dayNumber: it.dayNumber,
            title: it.title,
            description: it.description,
            altitude: it.altitude,
            activities: it.activities || [],
          })) || []
        )
        setRequiredGear(
          data.requiredGear?.map((rg: any) => ({
            name: rg.product?.name || "",
            quantity: rg.quantity,
            required: rg.required,
          })) || []
        )
      } else {
        toast.error("Failed to load expedition")
        router.push("/dashboard/expeditions")
      }
    } catch (error) {
      console.error("Error fetching expedition:", error)
      toast.error("Failed to load expedition")
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    if (id) {
      fetchExpedition()
    }
  }, [id, fetchExpedition])

  const handleTitleChange = (value: string) => {
    setFormData({
      ...formData,
      title: value,
      slug: formData.slug || slugify(value),
    })
  }

  const addItinerary = () => {
    const newDay = Math.max(...itineraries.map((i) => i.dayNumber), 0) + 1
    setItineraries([
      ...itineraries,
      {
        dayNumber: newDay,
        title: "",
        description: "",
        altitude: undefined,
        activities: [],
      },
    ])
  }

  const removeItinerary = (index: number) => {
    setItineraries(itineraries.filter((_, i) => i !== index))
  }

  const updateItinerary = (index: number, field: string, value: any) => {
    const updated = [...itineraries]
    updated[index] = { ...updated[index], [field]: value }
    setItineraries(updated)
  }

  const addRequiredGear = () => {
    setRequiredGear([...requiredGear, { name: "", quantity: 1, required: true }])
  }

  const removeRequiredGear = (index: number) => {
    setRequiredGear(requiredGear.filter((_, i) => i !== index))
  }

  const updateRequiredGear = (index: number, field: string, value: any) => {
    const updated = [...requiredGear]
    updated[index] = { ...updated[index], [field]: value }
    setRequiredGear(updated)
  }

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB")
      return
    }

    setUploadingHero(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setFormData(prev => ({ ...prev, heroImage: data.url }))
        toast.success("Hero image uploaded successfully")
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to upload image")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setUploadingHero(false)
      e.target.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/expeditions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          altitude: parseInt(formData.altitude),
          duration: parseInt(formData.duration),
          basePrice: parseFloat(formData.basePrice),
          maxGroupSize: parseInt(formData.maxGroupSize),
          minGroupSize: parseInt(formData.minGroupSize),
          successRate: formData.successRate ? parseFloat(formData.successRate) : null,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          videoUrl: formData.videoUrl?.trim() || null,
          mountainRange: formData.mountainRange || null,
          itineraries,
        }),
      })

      if (res.ok) {
        toast.success("Expedition updated successfully")
        router.push("/dashboard/expeditions")
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to update expedition")
      }
    } catch (error) {
      console.error("Error updating expedition:", error)
      toast.error("Failed to update expedition")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Edit Expedition</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Update expedition details
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Textarea
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                required
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMALL_PEAKS">Small Peaks</SelectItem>
                    <SelectItem value="TREKKING_PEAKS">Trekking Peaks</SelectItem>
                    <SelectItem value="MOUNTAINEERING">Mountaineering</SelectItem>
                    <SelectItem value="ROAD_TRIPS">Road Trips</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty *</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                    <SelectItem value="EXTREME">Extreme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mountainRange">Mountain Range</Label>
                <Select
                  value={formData.mountainRange}
                  onValueChange={(value) => setFormData({ ...formData, mountainRange: value === "NONE" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">— None —</SelectItem>
                    <SelectItem value="KARAKORAM">Karakoram</SelectItem>
                    <SelectItem value="HIMALAYA">Himalaya</SelectItem>
                    <SelectItem value="HINDU_KUSH">Hindu Kush</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude (for weather)</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="e.g., 34.787"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude (for weather)</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="e.g., 73.333"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="altitude">Altitude (m) *</Label>
                <Input
                  id="altitude"
                  type="number"
                  value={formData.altitude}
                  onChange={(e) => setFormData({ ...formData, altitude: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (days) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minGroupSize">Min Group Size</Label>
                <Input
                  id="minGroupSize"
                  type="number"
                  value={formData.minGroupSize}
                  onChange={(e) => setFormData({ ...formData, minGroupSize: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxGroupSize">Max Group Size *</Label>
                <Input
                  id="maxGroupSize"
                  type="number"
                  value={formData.maxGroupSize}
                  onChange={(e) => setFormData({ ...formData, maxGroupSize: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (PKR) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="successRate">Success Rate (%)</Label>
                <Input
                  id="successRate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.successRate}
                  onChange={(e) => setFormData({ ...formData, successRate: e.target.value })}
                  placeholder="e.g., 85.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroImage">Hero Image</Label>
              <Input
                id="heroImage"
                type="file"
                accept="image/*"
                onChange={handleHeroImageUpload}
                disabled={uploadingHero}
                className="cursor-pointer"
              />
              {formData.heroImage && (
                <div className="mt-2 relative w-64 h-40">
                  <Image src={formData.heroImage} alt="Hero preview" fill className="object-cover rounded-lg border border-border" sizes="256px" />
                </div>
              )}
              {uploadingHero && (
                <p className="text-sm text-muted-foreground">Uploading...</p>
              )}
              <p className="text-xs text-muted-foreground">
                Upload hero image from your device (max 10MB)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL (optional)</Label>
              <Input
                id="videoUrl"
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="YouTube, Vimeo, or direct video link"
              />
              <p className="text-xs text-muted-foreground">
                Paste a YouTube or Vimeo URL, or a direct link to an MP4/WebM video. Leave empty to hide the video section.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>

            {/* <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">SEO Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">SEO Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  rows={2}
                />
              </div>
            </div> */}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Itinerary</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItinerary}>
                <Plus className="h-4 w-4 mr-2" />
                Add Day
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {itineraries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No itinerary items. Click &quot;Add Day&quot; to add one.</p>
            ) : (
              itineraries.map((itinerary, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Day {itinerary.dayNumber}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItinerary(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Day Title *</Label>
                      <Input
                        value={itinerary.title}
                        onChange={(e) => updateItinerary(index, "title", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Altitude (m)</Label>
                      <Input
                        type="number"
                        value={itinerary.altitude || ""}
                        onChange={(e) => updateItinerary(index, "altitude", e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Textarea
                      value={itinerary.description}
                      onChange={(e) => updateItinerary(index, "description", e.target.value)}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Activities (comma-separated)</Label>
                    <Input
                      value={itinerary.activities.join(", ")}
                      onChange={(e) => updateItinerary(index, "activities", e.target.value.split(",").map((a) => a.trim()).filter(Boolean))}
                      placeholder="e.g., Acclimatization, Trek to Base Camp"
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Required Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="requiredEquipment" className="text-xs text-muted-foreground">
                List all required gear and equipment. Each item on a new line.
              </Label>
              <Textarea
                id="requiredEquipment"
                value={formData.requiredEquipment}
                onChange={(e) => setFormData({ ...formData, requiredEquipment: e.target.value })}
                placeholder={"Climbing harness\nHelmet\nCrampons\nIce axe\nDown suit\n..."}
                rows={8}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment &amp; Refund Policies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="paymentPolicy">Payment Procedure</Label>
              <Textarea
                id="paymentPolicy"
                value={formData.paymentPolicy}
                onChange={(e) => setFormData({ ...formData, paymentPolicy: e.target.value })}
                placeholder="e.g. A 30% deposit is required to confirm your booking. The remaining balance is due 60 days before departure..."
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refundPolicy">Refund Policy</Label>
              <Textarea
                id="refundPolicy"
                value={formData.refundPolicy}
                onChange={(e) => setFormData({ ...formData, refundPolicy: e.target.value })}
                placeholder="e.g. Cancellations more than 90 days before departure receive a full refund minus the deposit. 60–90 days: 50% refund..."
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" variant="summit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Slots manager — outside the form so it has its own API interactions */}
      {id && (
        <ExpeditionSlotsManager
          expeditionId={id}
          basePrice={parseFloat(formData.basePrice) || 0}
        />
      )}
    </div>
  )
}
