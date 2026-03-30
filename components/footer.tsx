"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Mountain, Phone, Mail, MapPin, Facebook, Instagram, Youtube } from "lucide-react"

export function Footer() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/settings/logo")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.logoUrl && setLogoUrl(data.logoUrl))
      .catch(() => {})
  }, [])

  return (
    <footer className="border-t border-border bg-card mt-20">
      {/* Top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* ── Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              {logoUrl ? (
                <div className="relative h-8 w-8 shrink-0">
                  <Image
                    src={logoUrl}
                    alt="K2 Climbers"
                    fill
                    className="object-contain"
                    sizes="32px"
                    unoptimized={logoUrl.startsWith("http")}
                  />
                </div>
              ) : (
                <Mountain className="h-8 w-8 text-orange-500" />
              )}
              <span className="text-xl font-black tracking-tight group-hover:text-orange-500 transition-colors">
                K2 Climbers
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              Climb Beyond Limits. Your trusted partner for world-class mountaineering expeditions across Pakistan&apos;s greatest peaks.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
                { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
                { href: "https://youtube.com", icon: Youtube, label: "YouTube" },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-8 w-8 flex items-center justify-center border border-border text-muted-foreground hover:border-orange-500/50 hover:text-orange-500 transition-colors"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Explore ── */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-500 mb-4">Explore</p>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/expeditions", label: "All Expeditions" },
                { href: "/expeditions/custom", label: "Custom Expedition" },
                { href: "/shop", label: "Shop & Rent Gear" },
                { href: "/about", label: "About Us" },
                { href: "/climbers", label: "Our Team" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Support ── */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-500 mb-4">Support</p>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/contact", label: "Contact Us" },
                { href: "/terms", label: "Terms & Conditions" },
                { href: "/profile", label: "My Account" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-500 mb-4">Contact</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="tel:+923355428818"
                  className="flex items-start gap-2.5 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <Phone className="h-4 w-4 shrink-0 mt-0.5 group-hover:text-orange-500 transition-colors" />
                  <span>+92 335 5428818</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+923335440482"
                  className="flex items-start gap-2.5 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <Phone className="h-4 w-4 shrink-0 mt-0.5 group-hover:text-orange-500 transition-colors" />
                  <span>+92 333 5440482</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@k2climbers.com"
                  className="flex items-start gap-2.5 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <Mail className="h-4 w-4 shrink-0 mt-0.5 group-hover:text-orange-500 transition-colors" />
                  <span>info@k2climbers.com</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:booking@k2climbers.com"
                  className="flex items-start gap-2.5 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <Mail className="h-4 w-4 shrink-0 mt-0.5 group-hover:text-orange-500 transition-colors" />
                  <span>booking@k2climbers.com</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-orange-500/70" />
                <span className="leading-relaxed">
                  Office No 226, 2nd Floor, Dubai Plaza,<br />
                  6th Road, Rawalpindi 46000
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-12 pt-7 flex flex-col items-center gap-2 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} K2 Climbers. All rights reserved.</p>
          <p>Created with ❤️ by Mountaineers</p>
        </div>
      </div>
    </footer>
  )
}
