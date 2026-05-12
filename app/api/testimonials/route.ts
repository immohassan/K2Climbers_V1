import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate, createTestimonialSchema } from "@/lib/validation"
import { generalWriteLimiter } from "@/lib/rate-limit"
import { revalidatePath } from "next/cache"

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { order: "asc" },
    })
    return NextResponse.json(testimonials, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const limited = generalWriteLimiter(request)
  if (limited) return limited

  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = validate(createTestimonialSchema, body)
    if (!parsed.ok) return parsed.response
    const { name, role, content, imageUrl, order } = parsed.data

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        role: role || null,
        content,
        imageUrl: imageUrl || null,
        order: order ?? 0,
      },
    })
    revalidatePath("/")
    return NextResponse.json(testimonial, { status: 201 })
  } catch (error) {
    console.error("Error creating testimonial:", error)
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 })
  }
}
