"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

interface Post {
  id: string
  title: string
  content: string
  images: string[]
  tags: string[]
  isPublished: boolean
  isFeatured: boolean
  userId: string
}

export default function EditPostPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [post, setPost] = useState<Post | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: [] as string[],
    images: [] as string[],
    isPublished: false,
    isFeatured: false,
  })
  const [tagInput, setTagInput] = useState("")
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (session && id) {
      fetchPost()
    } else if (!session) {
      router.push("/auth/signin")
    }
  }, [session, id, router])

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/community/${id}`)
      if (res.ok) {
        const data = await res.json()
        setPost(data)
        setFormData({
          title: data.title,
          content: data.content,
          tags: data.tags || [],
          images: data.images || [],
          isPublished: data.isPublished,
          isFeatured: data.isFeatured,
        })
      } else {
        toast.error("Failed to load post")
        router.push("/community")
      }
    } catch (error) {
      console.error("Error fetching post:", error)
      toast.error("Failed to load post")
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = session?.user.role === "ADMIN" || session?.user.role === "SUPER_ADMIN"
  const isOwner = post?.userId === session?.user.id
  const canEdit = isOwner || isAdmin

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }))
        toast.success("Image uploaded successfully")
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to upload image")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ""
    }
  }

  const removeImage = (imageToRemove: string) => {
    setFormData({ ...formData, images: formData.images.filter(img => img !== imageToRemove) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canEdit) {
      toast.error("You don't have permission to edit this post")
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/community/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success("Post updated successfully")
        router.push(`/community/${id}`)
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to update post")
      }
    } catch (error) {
      console.error("Error updating post:", error)
      toast.error("Failed to update post")
    } finally {
      setSaving(false)
    }
  }

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-16 bg-background">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">Loading...</div>
          </div>
        </main>
      </>
    )
  }

  if (!post || !canEdit) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-16 bg-background">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">Post not found or you don't have permission to edit it.</div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Edit Post</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Update your community post
                </p>
              </div>
              <Link href={`/community/${id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </Link>
            </div>

            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Post Details</CardTitle>
                  <CardDescription>
                    {isAdmin 
                      ? "You can publish/unpublish and feature posts."
                      : "Your changes will be saved."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={10}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addTag()
                          }
                        }}
                        placeholder="Add a tag and press Enter"
                      />
                      <Button type="button" variant="outline" onClick={addTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="images">Images</Label>
                    <div className="flex gap-2">
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="cursor-pointer"
                      />
                      {uploading && (
                        <span className="text-sm text-muted-foreground self-center">Uploading...</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload images from your device (max 10MB per image)
                    </p>
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {formData.images.map((image, idx) => (
                          <div key={idx} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-card border border-border">
                              <img
                                src={image}
                                alt={`Image ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EInvalid%3C/text%3E%3C/svg%3E"
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(image)}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="space-y-3 pt-4 border-t border-border">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isPublished"
                          checked={formData.isPublished}
                          onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="isPublished">Published</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isFeatured"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="isFeatured">Featured</Label>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-4 pt-4">
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
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
