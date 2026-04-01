import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { validate, updateExpeditionSchema } from "@/lib/validation"
import { revalidatePath } from "next/cache"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const expedition = await prisma.expedition.findUnique({
      where: { id },
      include: {
        guides: { select: { id: true, name: true, image: true, bio: true } },
        itineraries: { orderBy: { dayNumber: "asc" } },
        requiredGear: { include: { product: true } },
        summitRecords: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
        _count: { select: { bookings: true, summitRecords: true } },
      },
    })

    if (!expedition) {
      return NextResponse.json({ error: "Expedition not found" }, { status: 404 })
    }

    return NextResponse.json(expedition)
  } catch (error) {
    console.error("Error fetching expedition:", error)
    return NextResponse.json({ error: "Failed to fetch expedition" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = validate(updateExpeditionSchema, body)
    if (!parsed.ok) return parsed.response

    const { itineraries, requiredGear, ...expeditionData } = parsed.data

    const updateData: Record<string, unknown> = { ...expeditionData }
    if (expeditionData.successRate !== undefined) {
      updateData.successRate = expeditionData.successRate ?? null
    }
    if (expeditionData.latitude !== undefined) {
      updateData.latitude = expeditionData.latitude ?? null
    }
    if (expeditionData.longitude !== undefined) {
      updateData.longitude = expeditionData.longitude ?? null
    }
    if (expeditionData.videoUrl !== undefined) {
      updateData.videoUrl = expeditionData.videoUrl ?? null
    }

    await prisma.expedition.update({ where: { id }, data: updateData })

    if (itineraries !== undefined) {
      await prisma.itinerary.deleteMany({ where: { expeditionId: id } })
      if (itineraries.length > 0) {
        await prisma.itinerary.createMany({
          data: itineraries.map((it) => ({
            expeditionId: id,
            dayNumber: it.dayNumber, title: it.title, description: it.description,
            altitude: it.altitude ?? null, activities: it.activities ?? [], order: it.dayNumber,
          })),
        })
      }
    }

    if (requiredGear !== undefined) {
      await prisma.expeditionGear.deleteMany({ where: { expeditionId: id } })
      if (requiredGear.length > 0) {
        const gearData = await Promise.all(
          requiredGear.map(async (rg) => {
            let productId = rg.productId ?? null
            if (rg.name && !productId) {
              const gearSlug = rg.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
              let product = await prisma.product.findUnique({ where: { slug: gearSlug } })
              if (!product) {
                product = await prisma.product.create({
                  data: {
                    name: rg.name, slug: gearSlug,
                    description: "Required gear for expedition",
                    category: "OTHER", price: 0, inStock: true,
                  },
                })
              }
              productId = product.id
            }
            return { expeditionId: id, productId: productId!, quantity: rg.quantity ?? 1, required: rg.required !== false }
          })
        )
        await prisma.expeditionGear.createMany({ data: gearData })
      }
    }

    const updatedExpedition = await prisma.expedition.findUnique({
      where: { id },
      include: { itineraries: true, requiredGear: true },
    })

    revalidatePath("/expeditions")
    if (updatedExpedition) revalidatePath(`/expeditions/${updatedExpedition.slug}`)
    revalidatePath("/")

    return NextResponse.json(updatedExpedition)
  } catch (error) {
    console.error("Error updating expedition:", error)
    return NextResponse.json({ error: "Failed to update expedition" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await prisma.expedition.delete({ where: { id } })

    revalidatePath("/expeditions")
    revalidatePath("/")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting expedition:", error)
    return NextResponse.json({ error: "Failed to delete expedition" }, { status: 500 })
  }
}
