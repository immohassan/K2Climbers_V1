import Link from "next/link"
import Image from "next/image"
import { Mountain, Award, TrendingUp, Calendar, ArrowUpRight, ArrowLeft, Mail, Phone } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Climber {
  id: string
  name: string | null
  bio: string | null
  image: string | null
  email: string
  phone: string | null
  summitRecords: Array<{
    id: string
    status: string
    summitDate: Date | null
    altitude: number
    expedition: {
      id: string
      title: string
      slug: string
      altitude: number
      category?: string
      heroImage: string | null
    }
  }>
  certificates: Array<{
    id: string
    peakName: string
    altitude: number
    summitDate: Date
    verificationCode: string
  }>
}

const STATUS_COLORS: Record<string, string> = {
  SUCCESSFUL: "text-green-500 border-green-500/30 bg-green-500/10",
  UNSUCCESSFUL: "text-red-500 border-red-500/30 bg-red-500/10",
  ATTEMPTED: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
}

export function ClimberProfile({
  climber,
  successfulSummits,
  highestAltitude,
}: {
  climber: Climber
  successfulSummits: number
  highestAltitude: number
}) {
  const initials = climber.name
    ? climber.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "C"

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Back link */}
      <Link
        href="/climbers"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Climbers
      </Link>

      {/* Profile hero */}
      <div className="border border-border bg-card/30 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative h-24 w-24 sm:h-32 sm:w-32 shrink-0 border border-border overflow-hidden bg-muted">
            {climber.image ? (
              <Image
                src={climber.image}
                alt={climber.name ?? "Climber"}
                fill
                className="object-cover"
                sizes="128px"
                unoptimized={climber.image.startsWith("/api/")}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-muted-foreground/40">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-500 mb-1">
              Climber Profile
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
              {climber.name || "Anonymous Climber"}
            </h1>
            {climber.bio && (
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mb-4">
                {climber.bio}
              </p>
            )}

            {/* Contact info */}
            <div className="flex flex-wrap gap-4 mb-5">
              <a
                href={`mailto:${climber.email}`}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-orange-500 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                {climber.email}
              </a>
              {climber.phone && (
                <a
                  href={`tel:${climber.phone}`}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-orange-500 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {climber.phone}
                </a>
              )}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <div className="text-2xl font-black">{successfulSummits}</div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Summits
                </div>
              </div>
              {highestAltitude > 0 && (
                <div>
                  <div className="text-2xl font-black">{highestAltitude.toLocaleString()}m</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Highest
                  </div>
                </div>
              )}
              <div>
                <div className="text-2xl font-black">{climber.certificates.length}</div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Certificates
                </div>
              </div>
              <div>
                <div className="text-2xl font-black">{climber.summitRecords.length}</div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Expeditions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summit Records */}
      {climber.summitRecords.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <Mountain className="h-4 w-4 text-orange-500" />
            <h2 className="text-lg font-black tracking-tight">Summit Records</h2>
            <span className="text-xs text-muted-foreground font-mono">
              ({climber.summitRecords.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
            {climber.summitRecords.map((record) => (
              <div key={record.id} className="bg-background">
                <Link
                  href={`/expeditions/${record.expedition.slug}`}
                  className="group flex gap-4 p-5 hover:bg-card/60 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden bg-muted border border-border">
                    {record.expedition.heroImage ? (
                      <Image
                        src={record.expedition.heroImage}
                        alt={record.expedition.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized={record.expedition.heroImage.startsWith("/api/")}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Mountain className="h-5 w-5 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-sm leading-tight group-hover:text-orange-500 transition-colors line-clamp-2">
                        {record.expedition.title}
                      </p>
                      <span
                        className={`shrink-0 text-[10px] font-bold tracking-wider uppercase border px-2 py-0.5 ${
                          STATUS_COLORS[record.status] ?? "text-muted-foreground border-border bg-muted"
                        }`}
                      >
                        {record.status === "SUCCESSFUL" ? "Summit" : record.status.charAt(0) + record.status.slice(1).toLowerCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-muted-foreground font-mono">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {record.altitude.toLocaleString()}m reached
                      </span>
                      {record.summitDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(record.summitDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {climber.certificates.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <Award className="h-4 w-4 text-orange-500" />
            <h2 className="text-lg font-black tracking-tight">Certificates</h2>
            <span className="text-xs text-muted-foreground font-mono">
              ({climber.certificates.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {climber.certificates.map((cert) => (
              <Link
                key={cert.id}
                href={`/certificates/${cert.verificationCode}`}
                className="group bg-background p-5 hover:bg-card/60 transition-colors block"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="font-black text-sm leading-tight group-hover:text-orange-500 transition-colors">
                    {cert.peakName}
                  </p>
                  <ArrowUpRight className="h-4 w-4 text-border group-hover:text-orange-500 shrink-0 transition-colors" />
                </div>
                <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground font-mono">
                  <span className="flex items-center gap-1">
                    <Mountain className="h-3 w-3" />
                    {cert.altitude.toLocaleString()}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(cert.summitDate)}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-green-500">
                    ✓ Verified
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {climber.summitRecords.length === 0 && climber.certificates.length === 0 && (
        <div className="py-16 text-center border border-border">
          <Mountain className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No records yet for this climber.</p>
        </div>
      )}
    </div>
  )
}
