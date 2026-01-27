"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Upload } from "lucide-react"
import Image from "next/image"
import toast from "react-hot-toast"
import { formatDate } from "@/lib/utils"
import { ImageEditor } from "@/components/image-editor"

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageEditorOpen, setImageEditorOpen] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "",
    bio: "",
    phone: "",
    image: "",
    password: "",
    confirmPassword: "",
  })
  const [userStats, setUserStats] = useState({
    summitRecords: 0,
    bookings: 0,
    certificates: 0,
    rentals: 0,
  })
  const [createdAt, setCreatedAt] = useState<string>("")

  useEffect(() => {
    if (id) {
      fetchUser()
    }
  }, [id])

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/users/${id}`)
      if (res.ok) {
        const data = await res.json()
        setFormData({
          email: data.email || "",
          name: data.name || "",
          role: data.role || "",
          bio: data.bio || "",
          phone: data.phone || "",
          image: data.image || "",
          password: "",
          confirmPassword: "",
        })
        setUserStats({
          summitRecords: data._count.summitRecords || 0,
          bookings: data._count.bookings || 0,
          certificates: data._count.certificates || 0,
          rentals: data._count.rentals || 0,
        })
        setCreatedAt(data.createdAt)
      } else {
        toast.error("Failed to load user")
        router.push("/dashboard/users")
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      toast.error("Failed to load user")
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
      const response = await fetch(croppedImageDataUrl)
      const blob = await response.blob()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
        email: formData.email,
        name: formData.name,
        role: formData.role,
        bio: formData.bio,
        phone: formData.phone,
        image: formData.image,
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (res.ok) {
        toast.success("User updated successfully")
        router.push("/dashboard/users")
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to update user")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Failed to update user")
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
        <h1 className="text-2xl md:text-3xl font-bold">Edit User</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Update user information and permissions
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Image */}
            <div className="flex items-start gap-6">
              <div className="space-y-2">
                <Label>Profile Image</Label>
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.image || undefined} alt={formData.name || "User"} />
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="userImage" className="absolute bottom-0 right-0 cursor-pointer">
                    <div className="bg-summit text-white rounded-full p-2 hover:bg-summit/90 transition">
                      <Upload className="h-4 w-4" />
                    </div>
                  </label>
                  <Input
                    id="userImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={uploadingImage || imageEditorOpen}
                    className="hidden"
                  />
                </div>
                {uploadingImage && (
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="User name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLIMBER">Climber</SelectItem>
                        <SelectItem value="GUIDE">Guide</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="User biography..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div>
                <div className="text-sm text-muted-foreground">Summit Records</div>
                <div className="text-2xl font-bold">{userStats.summitRecords}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Bookings</div>
                <div className="text-2xl font-bold">{userStats.bookings}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Certificates</div>
                <div className="text-2xl font-bold">{userStats.certificates}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Rentals</div>
                <div className="text-2xl font-bold">{userStats.rentals}</div>
              </div>
            </div>

            {createdAt && (
              <div className="text-sm text-muted-foreground pt-2 border-t border-border">
                Member since {formatDate(createdAt)}
              </div>
            )}

            {/* Password Change */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="font-semibold">Change Password (Optional)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
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
              </div>
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
    </div>
  )
}
