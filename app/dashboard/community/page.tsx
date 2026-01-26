"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye, Check, X } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { formatDate } from "@/lib/utils"

interface Post {
  id: string
  title: string
  content: string
  isPublished: boolean
  isFeatured: boolean
  views: number
  likes: number
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

export default function CommunityPostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/community")
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      } else {
        toast.error("Failed to load posts")
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast.error("Failed to load posts")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return
    }

    try {
      const res = await fetch(`/api/community/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Post deleted")
        fetchPosts()
      } else {
        toast.error("Failed to delete post")
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Failed to delete post")
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/community/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentStatus }),
      })

      if (res.ok) {
        toast.success(`Post ${!currentStatus ? "published" : "unpublished"}`)
        fetchPosts()
      } else {
        toast.error("Failed to update post")
      }
    } catch (error) {
      console.error("Error updating post:", error)
      toast.error("Failed to update post")
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Community Posts</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage all community posts and stories
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Title</th>
                  <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Author</th>
                  <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Status</th>
                  <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Views</th>
                  <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Likes</th>
                  <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Created</th>
                  <th className="text-right p-3 md:p-4 font-semibold text-xs md:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No posts found.
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="border-b border-border hover:bg-card">
                      <td className="p-3 md:p-4">
                        <div className="font-medium text-xs md:text-sm">{post.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-none">
                          {post.content.substring(0, 50)}...
                        </div>
                      </td>
                      <td className="p-3 md:p-4 text-xs md:text-sm">
                        <div>{post.user.name || "Anonymous"}</div>
                        <div className="text-xs text-muted-foreground">{post.user.email}</div>
                      </td>
                      <td className="p-3 md:p-4">
                        <div className="flex flex-col gap-1">
                          {post.isPublished ? (
                            <Badge variant="default" className="text-xs w-fit">Published</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs w-fit">Draft</Badge>
                          )}
                          {post.isFeatured && (
                            <Badge variant="secondary" className="text-xs w-fit">Featured</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 md:p-4 text-xs md:text-sm">{post.views}</td>
                      <td className="p-3 md:p-4 text-xs md:text-sm">{post.likes}</td>
                      <td className="p-3 md:p-4 text-xs text-muted-foreground">
                        {formatDate(post.createdAt)}
                      </td>
                      <td className="p-3 md:p-4">
                        <div className="flex items-center justify-end gap-1 md:gap-2">
                          <Link href={`/community/${post.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                              <Eye className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          </Link>
                          <Link href={`/community/${post.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                              <Edit className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 md:h-10 md:w-10"
                            onClick={() => handleTogglePublish(post.id, post.isPublished)}
                            title={post.isPublished ? "Unpublish" : "Publish"}
                          >
                            {post.isPublished ? (
                              <X className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                            ) : (
                              <Check className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 md:h-10 md:w-10"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
