import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, Eye, MessageCircle, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Post {
  id: string
  title: string
  content: string
  images: string[]
  tags: string[]
  views: number
  likes: number
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

export function CommunityFeed({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">No community posts yet.</p>
        <p className="text-muted-foreground mt-2">Be the first to share your story!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
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
            </div>
          </CardHeader>
          <CardContent>
            <Link href={`/community/${post.id}`}>
              <h2 className="text-2xl font-bold mb-3 hover:text-glacier-400 transition cursor-pointer">
                {post.title}
              </h2>
            </Link>
            <p className="text-muted-foreground mb-4 line-clamp-3">
              {post.content}
            </p>
            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {post.images.slice(0, 3).map((image, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-lg overflow-hidden bg-card"
                  >
                    <img
                      src={image}
                      alt={`${post.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
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
      ))}
    </div>
  )
}
