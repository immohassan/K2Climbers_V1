import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty")
    const featured = searchParams.get("featured") === "true"

    const where: any = {
      isActive: true,
    }

    if (category) {
      where.category = category
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (featured) {
      where.featured = true
    }

    const expeditions = await prisma.expedition.findMany({
      where,
      include: {
        guides: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        itineraries: {
          orderBy: { dayNumber: "asc" },
        },
        _count: {
          select: {
            summitRecords: true,
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(expeditions)
  } catch (error) {
    console.error("Error fetching expeditions:", error)
    return NextResponse.json(
      { error: "Failed to fetch expeditions" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      slug,
      description,
      shortDescription,
      category,
      difficulty,
      altitude,
      duration,
      basePrice,
      location,
      heroImage,
      gallery,
      maxGroupSize,
      minGroupSize,
      metaTitle,
      metaDescription,
    } = body

    const expedition = await prisma.expedition.create({
      data: {
        title,
        slug,
        description,
        shortDescription,
        category,
        difficulty,
        altitude,
        duration,
        basePrice,
        location,
        heroImage,
        gallery: gallery || [],
        maxGroupSize,
        minGroupSize: minGroupSize || 1,
        metaTitle,
        metaDescription,
      },
    })

    return NextResponse.json(expedition, { status: 201 })
  } catch (error) {
    console.error("Error creating expedition:", error)
    return NextResponse.json(
      { error: "Failed to create expedition" },
      { status: 500 }
    )
  }
}
