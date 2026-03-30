import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { validate, createExpeditionSchema } from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty")
    const featured = searchParams.get("featured") === "true"

    const where: Record<string, unknown> = { isActive: true }
    if (category) where.category = category
    if (difficulty) where.difficulty = difficulty
    if (featured) where.featured = true

    const expeditions = await prisma.expedition.findMany({
      where,
      include: {
        guides: { select: { id: true, name: true, image: true } },
        itineraries: { orderBy: { dayNumber: "asc" } },
        _count: { select: { summitRecords: true, bookings: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(expeditions, {
      headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400" },
    })
  } catch (error) {
    console.error("Error fetching expeditions:", error)
    return NextResponse.json({ error: "Failed to fetch expeditions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = validate(createExpeditionSchema, body)
    if (!parsed.ok) return parsed.response
    const {
      title, slug, description, shortDescription, category, difficulty,
      altitude, duration, basePrice, location, latitude, longitude,
      heroImage, videoUrl, gallery, maxGroupSize, minGroupSize, successRate,
      metaTitle, metaDescription, itineraries, requiredGear,
    } = parsed.data

    let gearData: { productId: string; quantity: number; required: boolean }[] = []
    if (requiredGear && requiredGear.length > 0) {
      gearData = await Promise.all(
        requiredGear.map(async (rg) => {
          let productId = rg.productId ?? null
          if (rg.name && !productId) {
            const gearSlug = rg.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
            let product = await prisma.product.findFirst({
              where: {
                OR: [
                  { slug: gearSlug },
                  { name: { equals: rg.name, mode: "insensitive" } },
                ],
              },
            })
            if (!product) {
              product = await prisma.product.create({
                data: {
                  name: rg.name,
                  slug: gearSlug || `gear-${Date.now()}`,
                  description: "Required gear for expedition",
                  category: "OTHER",
                  price: 0,
                  inStock: true,
                },
              })
            }
            productId = product.id
          }
          return { productId: productId!, quantity: rg.quantity ?? 1, required: rg.required !== false }
        })
      )
    }

    const expedition = await prisma.expedition.create({
      data: {
        title, slug, description, shortDescription: shortDescription || null,
        category, difficulty, altitude, duration, basePrice, location,
        latitude: latitude ?? null, longitude: longitude ?? null,
        heroImage: heroImage || null, videoUrl: videoUrl || null,
        gallery: gallery || [],
        maxGroupSize: maxGroupSize ?? 0, minGroupSize: minGroupSize ?? 1,
        successRate: successRate ?? null,
        metaTitle: metaTitle || null, metaDescription: metaDescription || null,
        itineraries: itineraries
          ? {
              create: itineraries.map((it) => ({
                dayNumber: it.dayNumber, title: it.title, description: it.description,
                altitude: it.altitude ?? null, activities: it.activities ?? [], order: it.dayNumber,
              })),
            }
          : undefined,
        requiredGear: gearData.length > 0 ? { create: gearData } : undefined,
      },
      include: { itineraries: true, requiredGear: true },
    })

    return NextResponse.json(expedition, { status: 201 })
  } catch (error) {
    console.error("Error creating expedition:", error)
    return NextResponse.json({ error: "Failed to create expedition" }, { status: 500 })
  }
}
