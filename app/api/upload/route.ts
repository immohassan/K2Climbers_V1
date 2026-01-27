import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file is actually a File object
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Invalid file object" },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 20 * 1024 * 1024 // 20
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 10MB." },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads")
    try {
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }
    } catch (dirError) {
      console.error("Error creating uploads directory:", dirError)
      return NextResponse.json(
        { error: "Failed to create upload directory" },
        { status: 500 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    
    // Get extension from filename or MIME type
    let extension = "jpg" // default
    if (file.name && file.name.includes(".")) {
      extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
    } else {
      // Fallback to MIME type
      const mimeToExt: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
      }
      extension = mimeToExt[file.type] || "jpg"
    }
    
    const filename = `${timestamp}-${randomString}.${extension}`
    const filepath = join(uploadsDir, filename)

    try {
      // Write file to disk
      await writeFile(filepath, buffer)
    } catch (writeError) {
      console.error("Error writing file:", writeError)
      return NextResponse.json(
        { error: "Failed to save file" },
        { status: 501 }
      )
    }

    // Return the public URL
    const url = `/uploads/${filename}`

    return NextResponse.json({ url }, { status: 200 })
  } catch (error) {
    console.error("Error uploading file:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error("Error details:", { errorMessage, errorStack })
    return NextResponse.json(
      { error: `Failed to upload file: ${errorMessage}` },
      { status: 502 }
    )
  }
}
