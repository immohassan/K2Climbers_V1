import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Navbar } from "@/components/navbar"
import { CommunityFeed } from "@/components/community/community-feed"
import { CommunityPageClient } from "@/components/community/community-page-client"
import { prisma } from "@/lib/prisma"

async function getCommunityPosts() {
  try {
    const posts = await prisma.communityPost.findMany({
      where: { isPublished: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })
    return posts
  } catch (error) {
    console.error("Error fetching posts:", error)
    return []
  }
}

export default async function CommunityPage() {
  const posts = await getCommunityPosts()
  const session = await getServerSession(authOptions)

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4">Community</h1>
                <p className="text-base sm:text-xl text-muted-foreground">
                  Stories, experiences, and achievements from our climbing community
                </p>
              </div>
              {session && (
                <CommunityPageClient />
              )}
            </div>
          </div>

          <CommunityFeed posts={posts} />
        </div>
      </main>
    </>
  )
}
