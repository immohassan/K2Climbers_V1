"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, Eye, MessageCircle, Calendar, Edit, Trash2, ArrowLeft } from "lucide-react"
import { formatDate } from "@/lib/utils"
import toast from "react-hot-toast"

interface Post {
  id: string
  title: string
  content: string
  images: string[]
  tags: string[]
  views: number
  likes: number
  isPublished: boolean
  isFeatured: boolean
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
    bio: string | null
  }
}

interface Session {
  user: {
    id: string
    role: string
  }
}

export function CommunityPostDetail({ post, session }: { post: Post; session: Session | null }) {
  const { data: currentSession } = useSession()
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const isOwner = currentSession?.user.id === post.userId
  const isAdmin = currentSession?.user.role === "ADMIN" || currentSession?.user.role === "SUPER_ADMIN"
  const canEdit = isOwner || isAdmin

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/community/${post.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Post deleted successfully")
        router.push("/community")
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to delete post")
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Failed to delete post")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/community">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Community
          </Button>
        </Link>
        {canEdit && (
          <div className="flex gap-2">
            <Link href={`/community/${post.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href={`/climbers/${post.user.id}`}>
                <Avatar className="h-12 w-12 cursor-pointer">
                  <AvatarImage src={post.user.image || undefined} />
                  <AvatarFallback>
                    {post.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link href={`/climbers/${post.user.id}`}>
                  <h3 className="font-semibold hover:text-glacier-400 transition">
                    {post.user.name || "Anonymous"}
                  </h3>
                </Link>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(post.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {!post.isPublished && (
                <Badge variant="outline" className="text-xs">Draft</Badge>
              )}
              {post.isFeatured && (
                <Badge variant="default" className="text-xs">Featured</Badge>
              )}
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{post.title}</h1>
        </CardHeader>
        <CardContent className="space-y-6">
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {post.images.map((image, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video rounded-lg overflow-hidden bg-card"
                >
                  <Image
                    src={image}
                    alt={`${post.title} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="prose prose-invert max-w-none">
            <p className="text-base sm:text-lg text-muted-foreground whitespace-pre-line leading-relaxed">
              {post.content}
            </p>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t border-border">
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-1" />
              {post.likes}
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {post.views}
            </div>
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-1" />
              0
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
