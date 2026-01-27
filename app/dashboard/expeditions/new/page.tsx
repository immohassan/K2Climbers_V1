"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"
import { slugify } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"

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

export default function NewExpeditionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
    heroImage: "",
    maxGroupSize: "",
    minGroupSize: "1",
    successRate: "",
    metaTitle: "",
    metaDescription: "",
  })
  const [itineraries, setItineraries] = useState<ItineraryItem[]>([])
  const [requiredGear, setRequiredGear] = useState<RequiredGear[]>([])
  const [uploadingHero, setUploadingHero] = useState(false)

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
    if (!file) {
      console.log("No file selected")
      return
    }

    console.log("File selected:", file.name, file.type, file.size)

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      e.target.value = ""
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB")
      e.target.value = ""
      return
    }

    setUploadingHero(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      console.log("Uploading file to /api/upload...")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      console.log("Upload response status:", res.status)

      if (res.ok) {
        const data = await res.json()
        console.log("Upload successful, URL:", data.url)
        setFormData(prev => ({ ...prev, heroImage: data.url }))
        toast.success("Hero image uploaded successfully")
      } else {
        const error = await res.json().catch(() => ({ error: "Unknown error" }))
        console.error("Upload error:", error)
        toast.error(error.error || "Failed to upload image")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setUploadingHero(false)
      // Reset input to allow selecting the same file again
      e.target.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/expeditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          altitude: parseInt(formData.altitude),
          duration: parseInt(formData.duration),
          basePrice: parseFloat(formData.basePrice),
          maxGroupSize: parseInt(formData.maxGroupSize),
          minGroupSize: parseInt(formData.minGroupSize),
          successRate: formData.successRate ? parseFloat(formData.successRate) : null,
          itineraries,
          requiredGear,
        }),
      })

      if (res.ok) {
        const expedition = await res.json()
        toast.success("Expedition created successfully")
        router.push(`/dashboard/expeditions/${expedition.id}`)
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to create expedition")
      }
    } catch (error) {
      console.error("Error creating expedition:", error)
      toast.error("Failed to create expedition")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Expedition</h1>
        <p className="text-muted-foreground">
          Create a new mountaineering expedition
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
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
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
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Input
                    id="heroImage"
                    type="file"
                    accept="image/*"
                    onChange={handleHeroImageUpload}
                    disabled={uploadingHero}
                    className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-summit file:text-white hover:file:bg-summit/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                {uploadingHero && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Uploading image...
                  </p>
                )}
                {formData.heroImage && !uploadingHero && (
                  <div className="mt-2 space-y-2">
                    <div className="relative inline-block">
                      <img 
                        src={formData.heroImage} 
                        alt="Hero preview" 
                        className="max-w-xs rounded-lg border border-border" 
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, heroImage: "" }))}
                    >
                      Remove Image
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload hero image from your device (max 10MB). Supported formats: JPEG, PNG, WebP, GIF
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
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
            </div>
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
            <div className="flex items-center justify-between">
              <CardTitle>Required Gear</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addRequiredGear}>
                <Plus className="h-4 w-4 mr-2" />
                Add Gear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {requiredGear.length === 0 ? (
              <p className="text-sm text-muted-foreground">No required gear. Click &quot;Add Gear&quot; to add items.</p>
            ) : (
              requiredGear.map((gear, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Gear Item {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequiredGear(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Gear Name *</Label>
                      <Input
                        value={gear.name}
                        onChange={(e) => updateRequiredGear(index, "name", e.target.value)}
                        placeholder="e.g., Climbing Rope, Helmet, Crampons"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={gear.quantity}
                        onChange={(e) => updateRequiredGear(index, "quantity", parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={gear.required}
                      onChange={(e) => updateRequiredGear(index, "required", e.target.checked)}
                      className="rounded"
                    />
                    <Label>Required</Label>
                  </div>
                </div>
              ))
            )}
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
          <Button type="submit" variant="summit" disabled={loading}>
            {loading ? "Creating..." : "Create Expedition"}
          </Button>
        </div>
      </form>
    </div>
  )
}
