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
    const expedition = await prisma.expedition.findUnique({
      where: { id },
      include: {
        guides: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
        itineraries: {
          orderBy: { dayNumber: "asc" },
        },
        requiredGear: {
          include: {
            product: true,
          },
        },
        summitRecords: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
            summitRecords: true,
          },
        },
      },
    })

    if (!expedition) {
      return NextResponse.json(
        { error: "Expedition not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(expedition)
  } catch (error) {
    console.error("Error fetching expedition:", error)
    return NextResponse.json(
      { error: "Failed to fetch expedition" },
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
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const {
      itineraries,
      requiredGear,
      ...expeditionData
    } = body

    // Update expedition basic data
    const expedition = await prisma.expedition.update({
      where: { id },
      data: {
        ...expeditionData,
        successRate: expeditionData.successRate ? parseFloat(expeditionData.successRate) : null,
      },
    })

    // Update itineraries if provided
    if (itineraries !== undefined) {
      // Delete existing itineraries
      await prisma.itinerary.deleteMany({
        where: { expeditionId: id },
      })
      // Create new itineraries
      if (itineraries.length > 0) {
        await prisma.itinerary.createMany({
          data: itineraries.map((it: any) => ({
            expeditionId: id,
            dayNumber: it.dayNumber,
            title: it.title,
            description: it.description,
            altitude: it.altitude,
            activities: it.activities || [],
            order: it.dayNumber,
          })),
        })
      }
    }

    // Update required gear if provided
    if (requiredGear !== undefined) {
      // Delete existing required gear
      await prisma.expeditionGear.deleteMany({
        where: { expeditionId: id },
      })
      // Create new required gear
      if (requiredGear.length > 0) {
        const gearData = await Promise.all(
          requiredGear.map(async (rg: any) => {
            // If gear has a name instead of productId, create or find the product
            let productId = rg.productId
            if (rg.name && !productId) {
              const slug = rg.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
              // Check if product exists
              let product = await prisma.product.findUnique({
                where: { slug },
              })
              // Create product if it doesn't exist
              if (!product) {
                product = await prisma.product.create({
                  data: {
                    name: rg.name,
                    slug,
                    description: `Required gear for expedition`,
                    category: "OTHER",
                    price: 0,
                    inStock: true,
                  },
                })
              }
              productId = product.id
            }
            return {
              expeditionId: id,
              productId,
              quantity: rg.quantity || 1,
              required: rg.required !== false,
            }
          })
        )
        await prisma.expeditionGear.createMany({
          data: gearData,
        })
      }
    }

    // Fetch updated expedition with relations
    const updatedExpedition = await prisma.expedition.findUnique({
      where: { id },
      include: {
        itineraries: true,
        requiredGear: true,
      },
    })

    return NextResponse.json(updatedExpedition)
  } catch (error) {
    console.error("Error updating expedition:", error)
    return NextResponse.json(
      { error: "Failed to update expedition" },
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
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    await prisma.expedition.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting expedition:", error)
    return NextResponse.json(
      { error: "Failed to delete expedition" },
      { status: 500 }
    )
  }
}
