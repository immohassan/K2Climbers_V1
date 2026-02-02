import { NextRequest, NextResponse } from "next/server"

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("latitude")
    const long = searchParams.get("longitude")

    if (!lat || !long) {
      return NextResponse.json(
        { error: "latitude and longitude are required" },
        { status: 400 }
      )
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(long)

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return NextResponse.json(
        { error: "Invalid latitude or longitude" },
        { status: 400 }
      )
    }

    const url = new URL(OPEN_METEO_URL)
    url.searchParams.set("latitude", String(latitude))
    url.searchParams.set("longitude", String(longitude))
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,wind_speed_10m_max")
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
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 }
    )
  }
}
