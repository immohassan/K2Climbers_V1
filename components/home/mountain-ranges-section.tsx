import Link from "next/link"
import { ArrowUpRight, Mountain } from "lucide-react"

// ── Distinct mountain outline SVGs for each range ──────────────────────────

// Karakoram: sharp, aggressive spires — K2's iconic near-perfect pyramid flanked by jagged neighbours
function KarakoramIllustration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 240 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Back range — distant, faint */}
      <polyline
        points="0,90 18,58 32,68 52,38 68,52 88,22 108,44 128,18 148,40 168,26 188,46 208,30 224,50 240,40 240,90"
        stroke={color} strokeWidth="0.8" strokeOpacity="0.2" fill="none" strokeLinejoin="round"
      />
      {/* Mid range */}
      <polyline
        points="0,90 10,72 28,78 50,55 70,65 95,35 115,58 135,28 155,50 178,38 200,60 220,44 240,56 240,90"
        stroke={color} strokeWidth="1" strokeOpacity="0.35" fill="none" strokeLinejoin="round"
      />
      {/* Foreground — K2 centred, pyramid with near-vertical flanks */}
      <polyline
        points="0,90 15,80 35,82 55,65 72,70 92,48 105,72 118,20 131,72 144,48 160,70 178,65 198,80 216,76 240,82 240,90"
        stroke={color} strokeWidth="1.8" strokeOpacity="0.75" fill="none" strokeLinejoin="round"
      />
      {/* K2 summit snow cap */}
      <polyline
        points="112,34 118,20 124,34"
        stroke={color} strokeWidth="1.4" strokeOpacity="0.9" fill="none" strokeLinejoin="round"
      />
      {/* Glacier lines descending from K2 */}
      <line x1="118" y1="24" x2="112" y2="46" stroke={color} strokeWidth="0.7" strokeOpacity="0.4" />
      <line x1="118" y1="24" x2="124" y2="46" stroke={color} strokeWidth="0.7" strokeOpacity="0.4" />
    </svg>
  )
}

// Himalaya: wide, sweeping massif — Nanga Parbat's broad Rupal face, long ridgelines
function HimalayaIllustration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 240 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Back range */}
      <polyline
        points="0,90 20,55 45,62 70,42 95,50 120,30 145,46 170,36 195,52 220,44 240,55 240,90"
        stroke={color} strokeWidth="0.8" strokeOpacity="0.18" fill="none" strokeLinejoin="round"
      />
      {/* Mid range */}
      <polyline
        points="0,90 15,68 40,72 65,54 90,60 115,38 140,55 165,42 190,58 215,50 240,62 240,90"
        stroke={color} strokeWidth="1" strokeOpacity="0.3" fill="none" strokeLinejoin="round"
      />
      {/* Foreground — Nanga Parbat: broad, massive, gentle approach then steep face */}
      <polyline
        points="0,90 20,82 45,78 65,72 82,68 95,55 108,58 120,22 132,55 145,52 158,68 178,72 200,78 220,82 240,85 240,90"
        stroke={color} strokeWidth="1.8" strokeOpacity="0.75" fill="none" strokeLinejoin="round"
      />
      {/* Broad horizontal snow bands — Nanga Parbat's terraced glaciers */}
      <line x1="108" y1="40" x2="132" y2="40" stroke={color} strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="3 2" />
      <line x1="104" y1="50" x2="136" y2="50" stroke={color} strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="3 2" />
      {/* Summit plateau marker */}
      <line x1="117" y1="25" x2="123" y2="25" stroke={color} strokeWidth="1.2" strokeOpacity="0.8" />
    </svg>
  )
}

// Hindu Kush: rugged, irregular, many-peaked — wild and jagged with no single dominant summit
function HinduKushIllustration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 240 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Back range */}
      <polyline
        points="0,90 12,62 22,68 38,45 50,55 66,38 80,50 96,30 112,44 128,32 144,48 160,35 176,52 192,40 208,55 224,46 240,58 240,90"
        stroke={color} strokeWidth="0.8" strokeOpacity="0.18" fill="none" strokeLinejoin="round"
      />
      {/* Mid range */}
      <polyline
        points="0,90 8,74 20,76 36,58 48,65 62,48 76,56 92,40 106,52 120,36 136,50 150,38 166,54 182,44 198,60 212,52 228,62 240,68 240,90"
        stroke={color} strokeWidth="1" strokeOpacity="0.28" fill="none" strokeLinejoin="round"
      />
      {/* Foreground — many irregular peaks, no dominant centre, raw wilderness feel */}
      <polyline
        points="0,90 10,80 22,82 34,70 44,74 56,58 64,63 74,44 84,62 94,50 104,66 112,30 120,52 128,36 138,58 148,44 158,68 168,55 178,72 190,65 202,78 214,72 226,80 240,84 240,90"
        stroke={color} strokeWidth="1.8" strokeOpacity="0.75" fill="none" strokeLinejoin="round"
      />
      {/* Tirich Mir — tallest but not dramatically so, left-of-centre */}
      <polyline
        points="107,46 112,30 117,46"
        stroke={color} strokeWidth="1.3" strokeOpacity="0.85" fill="none" strokeLinejoin="round"
      />
      {/* Scattered rock texture dots */}
      <circle cx="56" cy="63" r="1" fill={color} fillOpacity="0.35" />
      <circle cx="84" cy="62" r="1" fill={color} fillOpacity="0.35" />
      <circle cx="148" cy="44" r="1" fill={color} fillOpacity="0.35" />
      <circle cx="168" cy="56" r="1" fill={color} fillOpacity="0.35" />
    </svg>
  )
}

const RANGES = [
  {
    key: "KARAKORAM",
    name: "Karakoram",
    subtitle: "Home of K2 & the Giants",
    description:
      "The Karakoram range harbours four of the world's fourteen 8,000m peaks — including K2, the world's second-highest and most formidable summit. A realm of sheer ice walls, vast glaciers and extreme altitude.",
    peaks: ["K2 — 8,611m", "Gasherbrum I — 8,080m", "Broad Peak — 8,051m", "Gasherbrum II — 8,034m"],
    accent: "from-orange-500/20 to-transparent",
    border: "border-orange-500/20 hover:border-orange-500/60",
    label: "text-orange-500",
    stat: "4 × 8000m peaks",
    svgColor: "#f97316",
    Illustration: KarakoramIllustration,
  },
  {
    key: "HIMALAYA",
    name: "Himalaya",
    subtitle: "Roof of the World",
    description:
      "The great Himalayan arc stretches across five nations and contains the highest points on Earth. Nanga Parbat — the ninth highest peak and one of the deadliest — crowns Pakistan's share of this legendary range.",
    peaks: ["Nanga Parbat — 8,126m", "Rakaposhi — 7,788m", "Haramosh — 7,409m", "Malubiting — 7,458m"],
    accent: "from-blue-500/20 to-transparent",
    border: "border-blue-500/20 hover:border-blue-500/60",
    label: "text-blue-400",
    stat: "Highest on Earth",
    svgColor: "#60a5fa",
    Illustration: HimalayaIllustration,
  },
  {
    key: "HINDU_KUSH",
    name: "Hindu Kush",
    subtitle: "Wild & Untamed West",
    description:
      "The Hindu Kush stretches 800 km through northern Pakistan and Afghanistan. Remote, rugged and rarely visited, it offers genuine wilderness mountaineering for those seeking a raw and uncrowded adventure.",
    peaks: ["Tirich Mir — 7,708m", "Noshaq — 7,492m", "Istoro Nal — 7,403m", "Saraghrar — 7,349m"],
    accent: "from-green-500/20 to-transparent",
    border: "border-green-500/20 hover:border-green-500/60",
    label: "text-green-500",
    stat: "800km of wilderness",
    svgColor: "#22c55e",
    Illustration: HinduKushIllustration,
  },
]

export function MountainRangesSection() {
  return (
    <section className="py-16 md:py-24 border-t border-border overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">

        <div className="mb-12 md:mb-16">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-3">Explore by Range</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Mountain Ranges
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm sm:text-base">
            Pakistan is home to three of the world&apos;s greatest mountain ranges. Choose your arena.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border">
          {RANGES.map((range) => (
            <div key={range.key}>
              <Link
                href={`/expeditions?range=${range.key}`}
                className={`group flex flex-col h-full bg-background border-0 transition-colors ${range.border} relative overflow-hidden`}
              >
                <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${range.accent} pointer-events-none`} />

                <div className="relative p-6 sm:p-7 flex flex-col h-full">
                  <div className="mb-5">
                    <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mb-3 ${range.label}`}>
                      {range.stat}
                    </p>

                    {/* Illustration + heading side by side */}
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-black tracking-tight group-hover:text-orange-500 transition-colors">
                          {range.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{range.subtitle}</p>
                      </div>
                      <div className="w-24 h-12 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <range.Illustration color={range.svgColor} />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                    {range.description}
                  </p>

                  <div className="space-y-1.5 mb-6">
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-2">
                      Notable Peaks
                    </p>
                    {range.peaks.map((peak) => (
                      <div key={peak} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mountain className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                        {peak}
                      </div>
                    ))}
                  </div>

                  <div className={`flex items-center gap-2 text-xs font-bold ${range.label} group-hover:gap-3 transition-all`}>
                    View Expeditions
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
