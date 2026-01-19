import { Navbar } from "@/components/navbar"
import { CommunityFeed } from "@/components/community/community-feed"
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Community</h1>
            <p className="text-xl text-muted-foreground">
              Stories, experiences, and achievements from our climbing community
            </p>
          </div>

          <CommunityFeed posts={posts} />
        </div>
      </main>
    </>
  )
}
