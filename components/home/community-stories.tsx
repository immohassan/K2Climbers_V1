import { CommunityStoriesClient } from "./community-stories-client"
import { prisma } from "@/lib/prisma"

async function getCommunityStories() {
  try {
    const posts = await prisma.communityPost.findMany({
      where: { isPublished: true, isFeatured: true },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    })
    return posts
  } catch (error) {
    console.error("Error fetching stories:", error)
    return []
  }
}

export async function CommunityStories() {
  const stories = await getCommunityStories()

  return <CommunityStoriesClient stories={stories} />
}
