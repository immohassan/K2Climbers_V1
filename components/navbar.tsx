"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mountain, Menu, X, User } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    fetch("/api/settings/logo")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.logoUrl && setLogoUrl(data.logoUrl))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            {logoUrl ? (
              <div className="relative h-8 w-8 shrink-0 sm:h-9 sm:w-9">
                <Image
                  src={logoUrl}
                  alt="K2 Climbers"
                  fill
                  className="object-contain"
                  sizes="36px"
                  unoptimized={logoUrl.startsWith("http")}
                />
              </div>
            ) : (
              <Mountain className="h-6 w-6 shrink-0 text-summit" />
            )}
            <span className="text-xl font-bold">K2 Climbers</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-sm hover:text-glacier-400 transition">
              Home
            </Link>
            <Link href="/about" className="text-sm hover:text-glacier-400 transition">
              About Us
            </Link>
            <Link href="/expeditions" className="text-sm hover:text-glacier-400 transition">
              Expeditions
            </Link>
            <Link href="/contact" className="text-sm hover:text-glacier-400 transition">
              Contact Us
            </Link>
            {/* <Link href="/shop" className="text-sm hover:text-glacier-400 transition">
              Shop & Rent
            </Link>
            <Link href="/community" className="text-sm hover:text-glacier-400 transition">
              Community
            </Link> */}
            {/* <Link href="/certificates" className="text-sm hover:text-glacier-400 transition">
              Certificates
            </Link> */}
            {/* <Link href="/climbers" className="text-sm hover:text-glacier-400 transition">
              Climbers
            </Link> */}
            <Link href="/expeditions/custom" className="text-sm hover:text-glacier-400 transition">
              Custom Expedition
            </Link>
            {session?.user.role == "SUPER_ADMIN" && (
              <Link href="/dashboard" className="text-sm hover:text-glacier-400 transition">
               Admin Dashboard
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {session ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 border border-border hover:border-orange-500/50 hover:text-orange-500 transition-colors text-sm font-semibold"
                >
                  <div className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-orange-500">
                      {(session.user?.name || session.user?.email || "U")[0].toUpperCase()}
                    </span>
                  </div>
                  {session.user?.name?.split(" ")[0] || "Profile"}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signup">
                  <Button variant="outline" size="sm">Sign Up</Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="summit" size="sm">Sign In</Button>
                </Link>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <Link href="/about" className="block text-sm">About Us</Link>
            <Link href="/expeditions" className="block text-sm">Expeditions</Link>
            <Link href="/contact" className="block text-sm">Contact Us</Link>
            <Link href="/climbers" className="block text-sm">Climbers</Link>
            <Link href="/expeditions/custom" className="block text-sm">Custom Expedition</Link>
            {/* <Link href="/community" className="block text-sm">Community</Link> */}
            {/* <Link href="/certificates" className="block text-sm">Certificates</Link> */}
            {session ? (
              <>
                <Link href="/profile" className="flex items-center gap-2 text-sm font-semibold py-1">
                  <div className="w-6 h-6 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-orange-500">
                      {(session.user?.name || session.user?.email || "U")[0].toUpperCase()}
                    </span>
                  </div>
                  {session.user?.name?.split(" ")[0] || "Profile"}
                </Link>
                {session.user.role === "SUPER_ADMIN" && (
                  <Link href="/dashboard" className="block text-sm">Admin Dashboard</Link>
                )}
                <button onClick={() => signOut()} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link href="/auth/signup">
                  <Button variant="outline" size="sm" className="w-full mb-2">Sign Up</Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="summit" size="sm" className="w-full mb-2">Sign In</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
