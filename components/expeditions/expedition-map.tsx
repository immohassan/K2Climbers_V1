"use client"

import { MapPin } from "lucide-react"

interface Props {
  latitude: number
  longitude: number
  locationName: string
  peakName: string
}

export function ExpeditionMap({ latitude, longitude, locationName, peakName }: Props) {
  // Google Maps embed — English labels, no API key needed for basic embed
  const zoom = 10
  const src = `https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed&hl=en`
  const fullUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=${zoom}`

  return (
    <div className="border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-orange-500" />
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-muted-foreground">Location</p>
        </div>
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-semibold text-orange-500 hover:text-orange-400 transition-colors"
        >
          Open in Maps ↗
        </a>
      </div>

      {/* Map iframe */}
      <div className="relative w-full h-52">
        <iframe
          src={src}
          title={`Map showing location of ${peakName}`}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-border flex items-center gap-1.5">
        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground truncate">{locationName}</p>
        <span className="text-[10px] text-muted-foreground/50 ml-auto shrink-0 font-mono">
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </span>
      </div>
    </div>
  )
}
