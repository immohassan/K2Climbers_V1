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
              <div className="flex items-center space-x-2">
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {session.user?.name || "Profile"}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
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
            <Link href="/expeditions/custom" className="block text-sm">Custom Expedition</Link>
            {/* <Link href="/community" className="block text-sm">Community</Link> */}
            {/* <Link href="/certificates" className="block text-sm">Certificates</Link> */}
            {session && session.user.role != "SUPER_ADMIN" ? (
              <>
                <Link href="/profile" className="block text-sm">Profile</Link>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </>
            ) : null}
            {session && session.user.role == "SUPER_ADMIN" ? (
              <>
                <Link href="/profile" className="block text-sm">Profile</Link>
                <Link href="/dashboard" className="block text-sm">Admin Dashboard</Link>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
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
