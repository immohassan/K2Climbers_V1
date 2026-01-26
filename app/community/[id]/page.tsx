import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Navbar } from "@/components/navbar"
import { CommunityPostDetail } from "@/components/community/community-post-detail"
import { prisma } from "@/lib/prisma"

async function getPost(id: string) {
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
      },
    })
    return post
  } catch (error) {
    console.error("Error fetching post:", error)
    return null
  }
}

export default async function PostPage({
  params,
}: {
  params: { id: string }
}) {
  const post = await getPost(params.id)
  const session = await getServerSession(authOptions)

  if (!post) {
    notFound()
  }

  // Only show published posts to non-owners/non-admins
  if (!post.isPublished && post.userId !== session?.user.id && 
      session?.user.role !== "ADMIN" && session?.user.role !== "SUPER_ADMIN") {
    notFound()
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <CommunityPostDetail post={post} session={session} />
        </div>
      </main>
    </>
  )
}
