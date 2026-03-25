"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Wind, Thermometer, Loader2, MapPin, Droplets, Sun, CloudRain, CloudLightning, CloudDrizzle, CloudFog } from "lucide-react"

// Custom snowflake icon — clearly distinct from rain
function SnowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {/* vertical bar */}
      <line x1="12" y1="2" x2="12" y2="22" />
      {/* horizontal bar */}
      <line x1="2" y1="12" x2="22" y2="12" />
      {/* diagonal bars */}
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
      {/* branch tips on vertical */}
      <line x1="12" y1="2" x2="9" y2="5" />
      <line x1="12" y1="2" x2="15" y2="5" />
      <line x1="12" y1="22" x2="9" y2="19" />
      <line x1="12" y1="22" x2="15" y2="19" />
      {/* branch tips on horizontal */}
      <line x1="2" y1="12" x2="5" y2="9" />
      <line x1="2" y1="12" x2="5" y2="15" />
      <line x1="22" y1="12" x2="19" y2="9" />
      <line x1="22" y1="12" x2="19" y2="15" />
    </svg>
  )
}

interface DailyWeather {
  time: string
  temperature_2m_max: number
  temperature_2m_min: number
  wind_speed_10m_max: number
  weathercode: number
  precipitation_sum: number
}

interface WeatherData {
  latitude: number
  longitude: number
  daily_units: {
    temperature_2m_max: string
    temperature_2m_min: string
    wind_speed_10m_max: string
    precipitation_sum: string
  }
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    wind_speed_10m_max: number[]
    weathercode: number[]
    precipitation_sum: number[]
  }
}

// WMO Weather Interpretation Codes → human-readable condition
// https://open-meteo.com/en/docs#weathervariables
function getWeatherCondition(code: number): {
  label: string
  icon: React.ElementType
  color: string
  bg: string
} {
  if (code === 0) return { label: "Clear Sky", icon: Sun, color: "text-yellow-500", bg: "bg-yellow-500/10" }
  if (code <= 2) return { label: "Partly Cloudy", icon: Cloud, color: "text-blue-400", bg: "bg-blue-400/10" }
  if (code === 3) return { label: "Overcast", icon: Cloud, color: "text-slate-400", bg: "bg-slate-400/10" }
  if (code <= 49) return { label: "Foggy", icon: CloudFog, color: "text-slate-400", bg: "bg-slate-400/10" }
  if (code <= 59) return { label: "Drizzle", icon: CloudDrizzle, color: "text-sky-400", bg: "bg-sky-400/10" }
  if (code <= 69) return { label: "Rainy", icon: CloudRain, color: "text-blue-500", bg: "bg-blue-500/10" }
  if (code <= 79) return { label: "Snowy", icon: SnowIcon, color: "text-cyan-400", bg: "bg-cyan-400/10" }
  if (code <= 84) return { label: "Rain Showers", icon: CloudRain, color: "text-blue-500", bg: "bg-blue-500/10" }
  if (code <= 86) return { label: "Snow Showers", icon: SnowIcon, color: "text-cyan-400", bg: "bg-cyan-400/10" }
  if (code <= 99) return { label: "Thunderstorm", icon: CloudLightning, color: "text-purple-500", bg: "bg-purple-500/10" }
  return { label: "Unknown", icon: Cloud, color: "text-muted-foreground", bg: "bg-muted" }
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return "Today"
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow"
  return d.toLocaleDateString("en-US", { weekday: "short" })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getTempColor(temp: number): string {
  if (temp >= 10) return "text-summit"
  if (temp >= 0) return "text-amber-600 dark:text-amber-400"
  return "text-glacier-400"
}

export function ExpeditionWeather({
  latitude,
  longitude,
  locationName,
}: {
  latitude: number | null
  longitude: number | null
  locationName?: string
}) {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  useEffect(() => {
    if (latitude == null || longitude == null) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    fetch(`/api/weather?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load weather")
        return res.json()
      })
      .then(setData)
      .catch(() => setError("Weather unavailable"))
      .finally(() => setLoading(false))
  }, [latitude, longitude])

  if (latitude == null || longitude == null) return null

  if (loading) {
    return (
      <Card className="overflow-hidden border-glacier-500/20 bg-gradient-to-br from-snow-50 to-glacier-50 dark:from-glacier-900/20 dark:to-glacier-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cloud className="h-5 w-5 text-glacier-500" />
            7-Day Forecast
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-glacier-500" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="overflow-hidden border-glacier-500/20 bg-gradient-to-br from-snow-50 to-glacier-50 dark:from-glacier-900/20 dark:to-glacier-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cloud className="h-5 w-5 text-glacier-500" />
            7-Day Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error ?? "No data"}</p>
        </CardContent>
      </Card>
    )
  }

  const days: DailyWeather[] = data.daily.time.map((time, i) => ({
    time,
    temperature_2m_max: data.daily.temperature_2m_max[i],
    temperature_2m_min: data.daily.temperature_2m_min[i],
    wind_speed_10m_max: data.daily.wind_speed_10m_max[i],
    weathercode: data.daily.weathercode[i],
    precipitation_sum: data.daily.precipitation_sum[i],
  }))

  const selected = days[selectedIndex]
  const tempMin = Math.min(...days.map((d) => d.temperature_2m_min))
  const tempMax = Math.max(...days.map((d) => d.temperature_2m_max))
  const range = tempMax - tempMin || 1

  const selectedCondition = getWeatherCondition(selected.weathercode)
  const SelectedIcon = selectedCondition.icon

  return (
    <Card className="min-w-0 overflow-hidden border-glacier-500/20 bg-gradient-to-br from-snow-50 to-glacier-50 dark:from-glacier-900/20 dark:to-glacier-950/30">
      <CardHeader className="p-4 pb-2 sm:p-6">
        <CardTitle className="flex flex-col gap-1 text-base sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:text-lg">
          <span className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-glacier-500" />
            7-Day Forecast
          </span>
          {locationName && (
            <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {locationName}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
        {/* Day strip */}
        <div className="-mx-1 flex gap-1 overflow-x-auto pb-1 scrollbar-thin sm:mx-0">
          {days.map((day, i) => {
            const cond = getWeatherCondition(day.weathercode)
            const DayIcon = cond.icon
            return (
              <button
                key={day.time}
                type="button"
                onClick={() => setSelectedIndex(i)}
                className={`flex min-w-[4.5rem] flex-col items-center rounded-lg border px-2 py-2 text-center transition-all focus:outline-none focus:ring-2 focus:ring-glacier-500/50 ${
                  selectedIndex === i
                    ? "border-glacier-500 bg-glacier-500/15 text-foreground shadow-sm"
                    : "border-border/60 bg-card/60 text-muted-foreground hover:border-glacier-400/40 hover:bg-glacier-500/10 hover:text-foreground"
                }`}
              >
                <span className="text-xs font-medium">{formatDay(day.time)}</span>
                <span className="text-[10px] opacity-70">{formatDate(day.time)}</span>
                <DayIcon className={`my-1 h-4 w-4 ${cond.color}`} />
                <span className={`text-sm font-semibold ${getTempColor(day.temperature_2m_max)}`}>
                  {Math.round(day.temperature_2m_max)}°
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {Math.round(day.temperature_2m_min)}°
                </span>
              </button>
            )
          })}
        </div>

        {/* Selected day detail */}
        {selected && (
          <div
            className="animate-in fade-in rounded-xl border border-glacier-500/20 bg-card/80 p-4 duration-200"
            key={selectedIndex}
          >
            {/* Condition header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{formatDay(selected.time)}</p>
                <p className="text-xs text-muted-foreground">{formatDate(selected.time)}</p>
              </div>
              <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${selectedCondition.bg}`}>
                <SelectedIcon className={`h-4 w-4 ${selectedCondition.color}`} />
                <span className={`text-sm font-semibold ${selectedCondition.color}`}>
                  {selectedCondition.label}
                </span>
              </div>
            </div>

            {/* Detail stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* High / Low */}
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-glacier-500/15">
                  <Thermometer className="h-5 w-5 text-glacier-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">High / Low</p>
                  <p className="font-semibold text-sm">
                    <span className={getTempColor(selected.temperature_2m_max)}>
                      {Math.round(selected.temperature_2m_max)}°
                    </span>
                    {" / "}
                    <span className="text-muted-foreground">
                      {Math.round(selected.temperature_2m_min)}°
                    </span>
                  </p>
                </div>
              </div>

              {/* Wind */}
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-glacier-500/15">
                  <Wind className="h-5 w-5 text-glacier-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Wind max</p>
                  <p className="font-semibold text-sm">
                    {Math.round(selected.wind_speed_10m_max)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {data.daily_units.wind_speed_10m_max}
                    </span>
                  </p>
                </div>
              </div>

              {/* Precipitation */}
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <Droplets className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Precipitation</p>
                  <p className="font-semibold text-sm">
                    {selected.precipitation_sum.toFixed(1)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {data.daily_units.precipitation_sum}
                    </span>
                  </p>
                </div>
              </div>

              {/* Temp bar */}
              <div className="flex flex-col justify-center">
                <p className="text-xs text-muted-foreground">Temp range</p>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-glacier-400 to-glacier-600"
                    style={{
                      width: `${((selected.temperature_2m_max - selected.temperature_2m_min) / range) * 100}%`,
                      minWidth: "20%",
                    }}
                  />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {Math.round(selected.temperature_2m_min)}° → {Math.round(selected.temperature_2m_max)}°
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground">
          Data: Open-Meteo · Temperatures in {data.daily_units.temperature_2m_max}
        </p>
      </CardContent>
    </Card>
  )
}
