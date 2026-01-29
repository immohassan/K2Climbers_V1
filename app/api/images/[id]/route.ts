import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const image = await prisma.storedImage.findUnique({
      where: { id },
    })
    if (!image) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    const buffer = Buffer.from(image.data)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": image.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error serving image:", error)
    return NextResponse.json(
      { error: "Failed to serve image" },
      { status: 500 }
    )
  }
}
