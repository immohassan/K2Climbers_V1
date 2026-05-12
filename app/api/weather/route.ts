import { NextRequest, NextResponse } from "next/server"
import { validate, weatherQuerySchema } from "@/lib/validation"

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = validate(weatherQuerySchema, {
      latitude: searchParams.get("latitude"),
      longitude: searchParams.get("longitude"),
    })
    if (!parsed.ok) return parsed.response
    const { latitude, longitude } = parsed.data

    const url = new URL(OPEN_METEO_URL)
    url.searchParams.set("latitude", String(latitude))
    url.searchParams.set("longitude", String(longitude))
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,wind_speed_10m_max,weathercode,precipitation_sum")
    url.searchParams.set("timezone", "auto")

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: "Weather service unavailable", details: text },
        { status: 502 }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching weather:", error)
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 })
  }
}
