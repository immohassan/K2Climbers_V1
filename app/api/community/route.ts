import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get("published")
    const featured = searchParams.get("featured") === "true"
    const userId = searchParams.get("userId")

    const where: any = {}

    if (published !== null) {
      where.isPublished = published === "true"
    }

    if (featured) {
      where.isFeatured = true
    }

    if (userId) {
      where.userId = userId
    }

    const posts = await prisma.communityPost.findMany({
      where,
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
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching community posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch community posts" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, images, tags, isPublished } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    // Users can create posts, but they default to unpublished unless admin
    const canPublish = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"

    const post = await prisma.communityPost.create({
      data: {
        title,
        content,
        images: images || [],
        tags: tags || [],
        userId: session.user.id,
        isPublished: canPublish ? (isPublished ?? true) : false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Error creating community post:", error)
    return NextResponse.json(
      { error: "Failed to create community post" },
      { status: 500 }
    )
  }
}
