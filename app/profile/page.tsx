"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Trash2,
  ArrowUpRight,
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

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "text-green-500 bg-green-500/10",
  PENDING: "text-yellow-500 bg-yellow-500/10",
  CANCELLED: "text-red-500 bg-red-500/10",
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
    const reader = new FileReader()
    reader.onloadend = () => {
      setSelectedImageFile(reader.result as string)
      setImageEditorOpen(true)
    }
    reader.onerror = () => toast.error("Failed to read image file")
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleImageEditorSave = async (croppedImageDataUrl: string) => {
    setImageEditorOpen(false)
    setUploadingImage(true)
    try {
      const response = await fetch(croppedImageDataUrl)
      const blob = await response.blob()
      const file = new File([blob], "profile-image.jpg", { type: "image/jpeg" })
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
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
    if (formData.password) {
      if (formData.password.length < 8) { toast.error("Password must be at least 8 characters"); return }
      if (!/[A-Z]/.test(formData.password)) { toast.error("Password must contain at least one uppercase letter"); return }
      if (!/[a-z]/.test(formData.password)) { toast.error("Password must contain at least one lowercase letter"); return }
      if (!/[0-9]/.test(formData.password)) { toast.error("Password must contain at least one number"); return }
    }
    setSaving(true)
    try {
      const updateData: Record<string, unknown> = {
        name: formData.name,
        bio: formData.bio,
        phone: formData.phone,
        image: formData.image,
      }
      if (formData.password) updateData.password = formData.password
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })
      if (res.ok) {
        toast.success("Profile updated successfully")
        setEditing(false)
        await fetchProfile()
        await update()
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
      const endpoint = summitEditingId
        ? `/api/profile/summit-records/${summitEditingId}`
        : "/api/profile/summit-records"
      const method = summitEditingId ? "PUT" : "POST"
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expeditionId: summitForm.expeditionId,
          status: summitForm.status,
          summitDate: summitForm.summitDate || null,
        }),
      })
      if (res.ok) {
        toast.success(summitEditingId ? "Summit record updated" : "Summit record added")
        setSummitDialogOpen(false)
        await fetchProfile()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to save")
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

  if (!session) return null

  if (loading) {
    return (
      <main className="min-h-screen pt-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 max-w-6xl">
          {/* Page header skeleton */}
          <div className="mb-10 md:mb-12">
            <div className="h-3 w-16 bg-muted animate-pulse rounded mb-3" />
            <div className="h-10 w-48 bg-muted animate-pulse rounded" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-10">
              {/* Profile card skeleton */}
              <div className="border border-border">
                <div className="flex items-center gap-5 px-6 py-6 border-b border-border">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-6 w-40 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-56 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  </div>
                </div>
                <div className="px-6 py-6 space-y-3">
                  <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-36 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-24 bg-muted animate-pulse rounded mt-4" />
                </div>
              </div>

              {/* Stats strip skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border border-border">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-background px-4 py-5 flex flex-col items-center gap-2">
                    <div className="h-5 w-5 bg-muted animate-pulse rounded" />
                    <div className="h-7 w-10 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>

              {/* Summit records skeleton */}
              <div className="border border-border">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <div className="space-y-1">
                    <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                </div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-b-0">
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right sidebar skeleton */}
            <div className="lg:col-span-1 space-y-6">
              <div className="border border-border">
                <div className="px-5 py-4 border-b border-border">
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                </div>
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-border last:border-b-0">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
              <div className="border border-border px-5 py-5 space-y-3">
                <div className="h-3 w-16 bg-muted animate-pulse rounded mb-4" />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between pt-3 border-t border-border first:border-t-0 first:pt-0">
                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-screen pt-16 bg-background">
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground text-sm">
          Profile not found
        </div>
      </main>
    )
  }

  const recordsThatCount = profile.summitRecords.filter(
    (r) => r.status === "SUCCESSFUL" && recordCountsAsSummit(r.expedition.category)
  )
  const successfulSummits = recordsThatCount.length
  const highestAltitude =
    recordsThatCount.length > 0
      ? Math.max(...recordsThatCount.map((r) => r.expedition.altitude))
      : 0

  const initials = (profile.name || profile.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <main className="min-h-screen pt-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 max-w-6xl">

        {/* Page header */}
        <div className="mb-10 md:mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-3">Account</p>
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              My Profile
            </h1>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-400 transition-colors group"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">

          {/* ── LEFT: main content ── */}
          <div className="lg:col-span-2 space-y-10">

            {/* ─── Profile card ─── */}
            <div className="border border-border">
              {/* Avatar + identity strip */}
              <div className="flex items-center gap-5 px-6 py-6 border-b border-border">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-orange-500/10 shrink-0 border border-border">
                  {(editing ? formData.image : profile.image) ? (
                    <Image
                      src={(editing ? formData.image : profile.image) as string}
                      alt={profile.name || "User"}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-orange-500">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-black truncate">
                    {profile.name || "No name set"}
                  </h2>
                  <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
                  <span className="inline-block mt-1.5 text-[10px] font-bold tracking-[0.15em] uppercase border border-orange-500/40 text-orange-500 px-2 py-0.5">
                    {profile.role.replace("_", " ")}
                  </span>
                </div>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="sm:hidden shrink-0 text-orange-500"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="px-6 py-6">
                {editing ? (
                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">Name</Label>
                        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground">Phone</Label>
                        <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+92 300 1234567" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="bio" className="text-xs uppercase tracking-wider text-muted-foreground">Bio</Label>
                      <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about yourself..." rows={3} />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="image" className="text-xs uppercase tracking-wider text-muted-foreground">Profile Image</Label>
                      <Input id="image" type="file" accept="image/*" onChange={handleImageSelect} disabled={uploadingImage || imageEditorOpen} className="cursor-pointer" />
                      {uploadingImage && <p className="text-xs text-muted-foreground">Uploading...</p>}
                      <p className="text-xs text-muted-foreground">Max 20MB — you can crop before uploading.</p>
                    </div>

                    {selectedImageFile && (
                      <ImageEditor
                        image={selectedImageFile}
                        isOpen={imageEditorOpen}
                        onClose={() => { setImageEditorOpen(false); setSelectedImageFile(null) }}
                        onSave={handleImageEditorSave}
                        aspect={1}
                        circularCrop={true}
                      />
                    )}

                    <div className="border-t border-border pt-5 space-y-4">
                      <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">Change Password</p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">New Password</Label>
                          <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Leave blank to keep current" />
                        </div>
                        {formData.password && (
                          <div className="space-y-1.5">
                            <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
                            <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="Confirm new password" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
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
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span>{profile.email}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile.bio && (
                      <p className="text-muted-foreground leading-relaxed pt-2 border-t border-border whitespace-pre-line">
                        {profile.bio}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                      Member since {formatDate(profile.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Stats strip ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border border-border">
              {[
                { icon: Mountain, value: successfulSummits, label: "Summits", color: "text-summit" },
                { icon: Calendar, value: profile._count.bookings, label: "Bookings", color: "text-orange-400" },
                { icon: Award, value: profile._count.certificates, label: "Certificates", color: "text-yellow-400" },
                { icon: TrendingUp, value: highestAltitude ? `${highestAltitude.toLocaleString()}m` : "—", label: "Highest Peak", color: "text-green-400" },
              ].map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="bg-background px-4 py-5 flex flex-col items-center text-center gap-1">
                  <Icon className={`h-5 w-5 mb-1 ${color}`} />
                  <span className="text-2xl font-black">{value}</span>
                  <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            {/* ─── Summit Records ─── */}
            <div className="border border-border">
              <div className="px-6 py-4 border-b border-border">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-0.5">Climbing</p>
                <h2 className="text-lg font-black">Summit Records</h2>
              </div>

              {profile.summitRecords.length === 0 ? (
                <div className="px-6 py-8 text-sm text-muted-foreground text-center">
                  No summit records yet.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {profile.summitRecords.map((record) => (
                    <div key={record.id} className="flex items-center gap-4 px-6 py-4 group hover:bg-muted/30 transition-colors">
                      <Link href={`/expeditions/${record.expedition.slug}`} className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate group-hover:text-orange-500 transition-colors">
                          {record.expedition.title}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs text-muted-foreground">
                          <span className="font-mono">{record.expedition.altitude.toLocaleString()}m</span>
                          {record.summitDate && <span>{formatDate(record.summitDate)}</span>}
                          <span className={`px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            record.status === "SUCCESSFUL" ? "bg-green-500/10 text-green-500"
                            : record.status === "FAILED" ? "bg-red-500/10 text-red-500"
                            : "bg-yellow-500/10 text-yellow-500"
                          }`}>
                            {record.status.replace("_", " ")}
                          </span>
                          {record.status === "SUCCESSFUL" && recordCountsAsSummit(record.expedition.category) && (
                            <span className="text-orange-500 text-[10px] font-semibold uppercase tracking-wide">counts</span>
                          )}
                        </div>
                      </Link>
                      <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
                        <button
                          onClick={() => openEditSummit(record)}
                          className="p-1.5 hover:text-orange-500 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleSummitDelete(record.id)}
                          className="p-1.5 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ─── Recent Bookings ─── */}
            {profile.bookings.length > 0 && (
              <div className="border border-border">
                <div className="px-6 py-4 border-b border-border">
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-0.5">History</p>
                  <h2 className="text-lg font-black">Recent Bookings</h2>
                </div>
                <div className="divide-y divide-border">
                  {profile.bookings.map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/expeditions/${booking.expedition.slug}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group"
                    >
                      {booking.expedition.heroImage && (
                        <div className="relative h-12 w-12 overflow-hidden shrink-0 bg-muted">
                          <Image
                            src={booking.expedition.heroImage}
                            alt={booking.expedition.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="48px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate group-hover:text-orange-500 transition-colors">
                          {booking.expedition.title}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          <span className="font-mono">{formatCurrency(booking.totalAmount)}</span>
                          <span className={`px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_COLORS[booking.status] ?? "bg-muted text-muted-foreground"}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 group-hover:text-orange-500 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Certificates ─── */}
            {profile.certificates.length > 0 && (
              <div className="border border-border">
                <div className="px-6 py-4 border-b border-border">
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-0.5">Achievements</p>
                  <h2 className="text-lg font-black">Certificates</h2>
                </div>
                <div className="divide-y divide-border">
                  {profile.certificates.map((cert) => (
                    <div key={cert.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group">
                      <Award className="h-5 w-5 text-yellow-400 shrink-0" />
                      <Link
                        href={`/certificates/${cert.verificationCode}`}
                        className="flex-1 min-w-0"
                      >
                        <p className="font-semibold text-sm truncate group-hover:text-orange-500 transition-colors">
                          {cert.peakName}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground font-mono">
                          <span>{cert.altitude.toLocaleString()}m</span>
                          <span>{formatDate(cert.summitDate)}</span>
                        </div>
                      </Link>
                      <Link
                        href={`/certificates/${cert.verificationCode}/print`}
                        target="_blank"
                        title="Download PDF"
                        className="shrink-0 p-1.5 text-muted-foreground hover:text-orange-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: sidebar ── */}
          <div className="lg:col-span-1 space-y-6">

            {/* Quick actions */}
            <div className="border border-border">
              <div className="px-5 py-4 border-b border-border">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">Quick Actions</p>
              </div>
              <div className="divide-y divide-border">
                <Link
                  href="/expeditions"
                  className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Mountain className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold group-hover:text-orange-500 transition-colors">Browse Expeditions</span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                </Link>
                {(profile.role === "ADMIN" || profile.role === "SUPER_ADMIN") && (
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-semibold text-orange-500 group-hover:text-orange-400 transition-colors">Admin Dashboard</span>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-orange-500 group-hover:text-orange-400 transition-colors" />
                  </Link>
                )}
              </div>
            </div>

            {/* Account summary */}
            <div className="border border-border px-5 py-5 space-y-3">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-4">Account</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold text-green-500">Active</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-3">
                <span className="text-muted-foreground">Role</span>
                <span className="font-semibold">{profile.role.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-3">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-semibold text-xs">{formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Summit Dialog */}
      <Dialog open={summitDialogOpen} onOpenChange={setSummitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{summitEditingId ? "Edit summit record" : "Add summit record"}</DialogTitle>
            <DialogDescription>
              Select an expedition. Altitude is taken from the expedition. Only Small Peaks and Mountaineering count toward your summit total.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Expedition</Label>
              <Select value={summitForm.expeditionId} onValueChange={(v) => setSummitForm((f) => ({ ...f, expeditionId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select expedition" /></SelectTrigger>
                <SelectContent>
                  {expeditions.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.title} ({e.altitude}m)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={summitForm.status} onValueChange={(v) => setSummitForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUCCESSFUL">Successful</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="summit-date">Summit date (optional)</Label>
              <Input id="summit-date" type="date" value={summitForm.summitDate} onChange={(e) => setSummitForm((f) => ({ ...f, summitDate: e.target.value }))} />
            </div>
            {summitForm.expeditionId && (
              <p className="text-sm text-muted-foreground">
                Altitude: <strong>{selectedExpeditionAltitude}m</strong> (from expedition)
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSummitDialogOpen(false)}>Cancel</Button>
            <Button variant="summit" onClick={handleSummitSave} disabled={summitSaving || !summitForm.expeditionId}>
              {summitSaving ? "Saving..." : summitEditingId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
