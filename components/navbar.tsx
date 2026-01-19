"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mountain, Menu, X, Search, User } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Mountain className="h-6 w-6 text-summit" />
            <span className="text-xl font-bold">K2 Climbers</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/expeditions" className="text-sm hover:text-glacier-400 transition">
              Expeditions
            </Link>
            <Link href="/shop" className="text-sm hover:text-glacier-400 transition">
              Shop & Rent
            </Link>
            <Link href="/community" className="text-sm hover:text-glacier-400 transition">
              Community
            </Link>
            <Link href="/certificates" className="text-sm hover:text-glacier-400 transition">
              Certificates
            </Link>
            <Link href="/expeditions/custom" className="text-sm hover:text-glacier-400 transition">
              Custom Expedition
            </Link>
            {session?.user && (
              <Link href="/dashboard" className="text-sm hover:text-glacier-400 transition">
                Dashboard
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
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
              <Link href="/auth/signin">
                <Button variant="summit" size="sm">Sign In</Button>
              </Link>
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
            <Link href="/expeditions" className="block text-sm">Expeditions</Link>
            <Link href="/shop" className="block text-sm">Shop & Rent</Link>
            <Link href="/community" className="block text-sm">Community</Link>
            <Link href="/certificates" className="block text-sm">Certificates</Link>
            {session ? (
              <>
                <Link href="/dashboard" className="block text-sm">Dashboard</Link>
                <Link href="/profile" className="block text-sm">Profile</Link>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/auth/signin">
                <Button variant="summit" size="sm" className="w-full">Sign In</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
