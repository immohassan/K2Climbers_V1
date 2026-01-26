import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    // Increment views
    await prisma.communityPost.update({
      where: { id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ 
      ...post, 
      views: post.views + 1,
      userId: post.userId 
    })
  } catch (error) {
    console.error("Error fetching community post:", error)
    return NextResponse.json(
      { error: "Failed to fetch community post" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { title, content, images, tags, isPublished, isFeatured } = body

    // Check if post exists and user has permission
    const existingPost = await prisma.communityPost.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
    const isOwner = existingPost.userId === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (images !== undefined) updateData.images = images
    if (tags !== undefined) updateData.tags = tags
    
    // Only admins can publish/unpublish or feature posts
    if (isAdmin) {
      if (isPublished !== undefined) updateData.isPublished = isPublished
      if (isFeatured !== undefined) updateData.isFeatured = isFeatured
    }

    const post = await prisma.communityPost.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error updating community post:", error)
    return NextResponse.json(
      { error: "Failed to update community post" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if post exists and user has permission
    const existingPost = await prisma.communityPost.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
    const isOwner = existingPost.userId === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    await prisma.communityPost.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting community post:", error)
    return NextResponse.json(
      { error: "Failed to delete community post" },
      { status: 500 }
    )
  }
}
