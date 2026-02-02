"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Mail, 
  Phone, 
  Edit, 
  Save, 
  X, 
  Mountain, 
  Calendar, 
  Award, 
  TrendingUp,
  Plus,
  Pencil,
  Trash2
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"
import { formatDate, formatCurrency } from "@/lib/utils"
import { ImageEditor } from "@/components/image-editor"
import { recordCountsAsSummit } from "@/lib/summit-utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ProfileData {
  id: string
  email: string
  name: string | null
  role: string
  image: string | null
  bio: string | null
  phone: string | null
  createdAt: string
  _count: {
    summitRecords: number
    bookings: number
    certificates: number
    rentals: number
  }
  summitRecords: Array<{
    id: string
    status: string
    summitDate: string | null
    altitude: number
    expedition: {
      id: string
      title: string
      slug: string
      altitude: number
      category: string
    }
  }>
  bookings: Array<{
    id: string
    totalAmount: number
    status: string
    createdAt: string
    expedition: {
      title: string
      slug: string
      heroImage: string | null
    }
  }>
  certificates: Array<{
    id: string
    peakName: string
    altitude: number
    summitDate: string
    verificationCode: string
  }>
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    phone: "",
    image: "",
    password: "",
    confirmPassword: "",
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageEditorOpen, setImageEditorOpen] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<string | null>(null)

  // Summit records: add/edit dialog
  const [summitDialogOpen, setSummitDialogOpen] = useState(false)
  const [summitEditingId, setSummitEditingId] = useState<string | null>(null)
  const [expeditions, setExpeditions] = useState<Array<{ id: string; title: string; altitude: number; category: string }>>([])
  const [summitForm, setSummitForm] = useState({
    expeditionId: "",
    status: "SUCCESSFUL",
    summitDate: "",
  })
  const [summitSaving, setSummitSaving] = useState(false)

  useEffect(() => {
    if (session) {
      fetchProfile()
    } else {
      router.push("/auth/signin")
    }
  }, [session, router])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile")
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setFormData({
          name: data.name || "",
          bio: data.bio || "",
          phone: data.phone || "",
          image: data.image || "",
          password: "",
          confirmPassword: "",
        })
      } else {
        toast.error("Failed to load profile")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Image size must be less than 20MB")
      return
    }

    // Create a preview URL for the image editor
    const reader = new FileReader()
    reader.onloadend = () => {
      setSelectedImageFile(reader.result as string)
      setImageEditorOpen(true)
    }
    reader.onerror = () => {
      toast.error("Failed to read image file")
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleImageEditorSave = async (croppedImageDataUrl: string) => {
    setImageEditorOpen(false)
    setUploadingImage(true)

    try {
      // Convert data URL to blob
      const response = await fetch(croppedImageDataUrl)
      const blob = await response.blob()
      
      // Create a File object from the blob
      const file = new File([blob], "profile-image.jpg", { type: "image/jpeg" })

      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setFormData(prev => ({ ...prev, image: data.url }))
        toast.success("Profile image uploaded successfully")
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to upload image")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setUploadingImage(false)
      setSelectedImageFile(null)
    }
  }

  const handleSave = async () => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.password && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setSaving(true)
    try {
      const updateData: any = {
        name: formData.name,
        bio: formData.bio,
        phone: formData.phone,
        image: formData.image,
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (res.ok) {
        toast.success("Profile updated successfully")
        setEditing(false)
        await fetchProfile()
        await update() // Update session
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        phone: profile.phone || "",
        image: profile.image || "",
        password: "",
        confirmPassword: "",
      })
    }
    setEditing(false)
  }

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <main className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Profile not found</div>
        </div>
      </main>
    )
  }

  // Only SMALL_PEAKS and MOUNTAINEERING count toward summit count
  const recordsThatCount = profile.summitRecords.filter(
    (r) => r.status === "SUCCESSFUL" && recordCountsAsSummit(r.expedition.category)
  )
  const successfulSummits = recordsThatCount.length
  const highestAltitude =
    recordsThatCount.length > 0
      ? Math.max(...recordsThatCount.map((r) => r.expedition.altitude))
      : 0

  const openAddSummit = () => {
    setSummitEditingId(null)
    setSummitForm({ expeditionId: "", status: "SUCCESSFUL", summitDate: "" })
    setSummitDialogOpen(true)
    fetchExpeditions()
  }

  const openEditSummit = (record: ProfileData["summitRecords"][0]) => {
    setSummitEditingId(record.id)
    setSummitForm({
      expeditionId: record.expedition.id,
      status: record.status,
      summitDate: record.summitDate
        ? new Date(record.summitDate).toISOString().slice(0, 10)
        : "",
    })
    setSummitDialogOpen(true)
    fetchExpeditions()
  }

  const fetchExpeditions = async () => {
    try {
      const res = await fetch("/api/expeditions")
      if (res.ok) {
        const data = await res.json()
        setExpeditions(
          data.map((e: { id: string; title: string; altitude: number; category: string }) => ({
            id: e.id,
            title: e.title,
            altitude: e.altitude,
            category: e.category,
          }))
        )
      }
    } catch {
      toast.error("Failed to load expeditions")
    }
  }

  const selectedExpeditionAltitude =
    summitForm.expeditionId
      ? expeditions.find((e) => e.id === summitForm.expeditionId)?.altitude ?? 0
      : 0

  const handleSummitSave = async () => {
    if (!summitForm.expeditionId) {
      toast.error("Please select an expedition")
      return
    }
    setSummitSaving(true)
    try {
      if (summitEditingId) {
        const res = await fetch(`/api/profile/summit-records/${summitEditingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expeditionId: summitForm.expeditionId,
            status: summitForm.status,
            summitDate: summitForm.summitDate || null,
          }),
        })
        if (res.ok) {
          toast.success("Summit record updated")
          setSummitDialogOpen(false)
          await fetchProfile()
        } else {
          const err = await res.json()
          toast.error(err.error || "Failed to update")
        }
      } else {
        const res = await fetch("/api/profile/summit-records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expeditionId: summitForm.expeditionId,
            status: summitForm.status,
            summitDate: summitForm.summitDate || null,
          }),
        })
        if (res.ok) {
          toast.success("Summit record added")
          setSummitDialogOpen(false)
          await fetchProfile()
        } else {
          const err = await res.json()
          toast.error(err.error || "Failed to add")
        }
      }
    } finally {
      setSummitSaving(false)
    }
  }

  const handleSummitDelete = async (id: string) => {
    if (!confirm("Remove this summit record?")) return
    try {
      const res = await fetch(`/api/profile/summit-records/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Summit record removed")
        await fetchProfile()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to remove")
      }
    } catch {
      toast.error("Failed to remove")
    }
  }

  return (
    <main className="min-h-screen pt-16 bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Manage your account and view your climbing achievements
                </p>
              </div>
              {!editing && (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                {/* Profile Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Your personal information and account details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                        <AvatarImage src={profile.image || undefined} alt={profile.name || "User"} />
                        <AvatarFallback>
                          <User className="h-10 w-10" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="text-xl sm:text-2xl font-bold">{profile.name || "No name"}</h2>
                        <p className="text-sm sm:text-base text-muted-foreground">{profile.email}</p>
                        <Badge variant="outline" className="mt-2">
                          {profile.role.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>

                    {editing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Your name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+92 300 1234567"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="image">Profile Image</Label>
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            disabled={uploadingImage || imageEditorOpen}
                            className="cursor-pointer"
                          />
                          {formData.image && (
                            <div className="mt-2 relative w-24 h-24">
                              <Image 
                                src={formData.image} 
                                alt="Profile preview" 
                                fill
                                className="rounded-full object-cover border border-border" 
                                sizes="96px"
                              />
                            </div>
                          )}
                          {uploadingImage && (
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Upload profile image from your device (max 20MB). You can crop and rotate before uploading.
                          </p>
                        </div>
                        {selectedImageFile && (
                          <ImageEditor
                            image={selectedImageFile}
                            isOpen={imageEditorOpen}
                            onClose={() => {
                              setImageEditorOpen(false)
                              setSelectedImageFile(null)
                            }}
                            onSave={handleImageEditorSave}
                            aspect={1}
                            circularCrop={true}
                          />
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="password">New Password (optional)</Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Leave blank to keep current password"
                          />
                        </div>
                        {formData.password && (
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                              placeholder="Confirm new password"
                            />
                          </div>
                        )}
                        <div className="flex gap-3">
                          <Button variant="summit" onClick={handleSave} disabled={saving}>
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button variant="outline" onClick={handleCancel}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm sm:text-base">
                          <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          <span>{profile.email}</span>
                        </div>
                        {profile.phone && (
                          <div className="flex items-center gap-3 text-sm sm:text-base">
                            <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                            <span>{profile.phone}</span>
                          </div>
                        )}
                        {profile.bio && (
                          <div className="pt-4 border-t border-border">
                            <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line">
                              {profile.bio}
                            </p>
                          </div>
                        )}
                        <div className="pt-4 border-t border-border text-xs sm:text-sm text-muted-foreground">
                          Member since {formatDate(profile.createdAt)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Mountain className="h-6 w-6 sm:h-8 sm:w-8 text-summit mb-2" />
                        <div className="text-2xl sm:text-3xl font-bold">{successfulSummits}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Summits</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-glacier-400 mb-2" />
                        <div className="text-2xl sm:text-3xl font-bold">{profile._count.bookings}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Bookings</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Award className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 mb-2" />
                        <div className="text-2xl sm:text-3xl font-bold">{profile._count.certificates}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Certificates</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 mb-2" />
                        <div className="text-2xl sm:text-3xl font-bold">{highestAltitude}m</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Highest Peak</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Summit Records */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle>Summit Records</CardTitle>
                      <CardDescription>
                        Add or edit records from available expeditions. Only Small Peaks and Mountaineering count toward your summit total.
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={openAddSummit}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add record
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {profile.summitRecords.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">
                        No summit records yet. Add one by selecting an expedition above.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {profile.summitRecords.map((record) => (
                          <div
                            key={record.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border"
                          >
                            <Link
                              href={`/expeditions/${record.expedition.slug}`}
                              className="flex-1 min-w-0"
                            >
                              <h3 className="font-semibold text-sm sm:text-base truncate">
                                {record.expedition.title}
                              </h3>
                              <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground mt-1 flex-wrap">
                                <span>{record.expedition.altitude}m</span>
                                {record.summitDate && (
                                  <span>{formatDate(record.summitDate)}</span>
                                )}
                                <Badge
                                  variant={
                                    record.status === "SUCCESSFUL"
                                      ? "default"
                                      : record.status === "FAILED"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {record.status.replace("_", " ")}
                                </Badge>
                                {record.status === "SUCCESSFUL" &&
                                  recordCountsAsSummit(record.expedition.category) && (
                                    <span className="text-summit text-xs">counts</span>
                                  )}
                              </div>
                            </Link>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditSummit(record)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleSummitDelete(record.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Add/Edit Summit Record Dialog */}
                <Dialog open={summitDialogOpen} onOpenChange={setSummitDialogOpen}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {summitEditingId ? "Edit summit record" : "Add summit record"}
                      </DialogTitle>
                      <DialogDescription>
                        Select an expedition. Altitude is taken from the expedition. Only Small Peaks and Mountaineering count toward your summit total.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Expedition</Label>
                        <Select
                          value={summitForm.expeditionId}
                          onValueChange={(v) =>
                            setSummitForm((f) => ({ ...f, expeditionId: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select expedition" />
                          </SelectTrigger>
                          <SelectContent>
                            {expeditions.map((e) => (
                              <SelectItem key={e.id} value={e.id}>
                                {e.title} ({e.altitude}m)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={summitForm.status}
                          onValueChange={(v) =>
                            setSummitForm((f) => ({ ...f, status: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUCCESSFUL">Successful</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                            <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="summit-date">Summit date (optional)</Label>
                        <Input
                          id="summit-date"
                          type="date"
                          value={summitForm.summitDate}
                          onChange={(e) =>
                            setSummitForm((f) => ({ ...f, summitDate: e.target.value }))
                          }
                        />
                      </div>
                      {summitForm.expeditionId && (
                        <p className="text-sm text-muted-foreground">
                          Altitude: <strong>{selectedExpeditionAltitude}m</strong> (from expedition)
                        </p>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setSummitDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="summit"
                        onClick={handleSummitSave}
                        disabled={summitSaving || !summitForm.expeditionId}
                      >
                        {summitSaving ? "Saving..." : summitEditingId ? "Update" : "Add"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Recent Bookings */}
                {profile.bookings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {profile.bookings.map((booking) => (
                          <Link
                            key={booking.id}
                            href={`/expeditions/${booking.expedition.slug}`}
                            className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-card transition-colors"
                          >
                            {booking.expedition.heroImage && (
                              <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={booking.expedition.heroImage}
                                  alt={booking.expedition.title}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base truncate">{booking.expedition.title}</h3>
                              <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                                <span>{formatCurrency(booking.totalAmount)}</span>
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  booking.status === "CONFIRMED" 
                                    ? "bg-green-500/20 text-green-400"
                                    : booking.status === "PENDING"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}>
                                  {booking.status}
                                </span>
                              </div>
                            </div>
                            <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Certificates */}
                {profile.certificates.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Certificates</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {profile.certificates.map((cert) => (
                          <Link
                            key={cert.id}
                            href={`/certificates/${cert.verificationCode}`}
                            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-card transition-colors"
                          >
                            <div>
                              <h3 className="font-semibold text-sm sm:text-base">{cert.peakName}</h3>
                              <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                                <span>{cert.altitude}m</span>
                                <span>{formatDate(cert.summitDate)}</span>
                              </div>
                            </div>
                            <Award className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Quick Actions */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/expeditions" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Mountain className="h-4 w-4 mr-2" />
                        Browse Expeditions
                      </Button>
                    </Link>
                    {profile.role === "ADMIN" || profile.role === "SUPER_ADMIN" ? (
                      <Link href="/dashboard" className="block">
                        <Button variant="summit" className="w-full justify-start">
                          <User className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
  )
}
