"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Mountain,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  CalendarCheck,
} from "lucide-react"
import { signOut } from "next-auth/react"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/expeditions", label: "Expeditions", icon: Mountain, exact: false },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck, exact: false },
  { href: "/dashboard/users", label: "Users", icon: Users, exact: false },
  { href: "/dashboard/certificates", label: "Certificates", icon: FileText, exact: false },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, exact: false },
]

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(href + "/")
}

export function DashboardNav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const currentPage = navItems.find((i) => isActive(pathname, i.href, i.exact))?.label ?? "Dashboard"

  return (
    <>
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-56 flex-col border-r border-border bg-card z-40">
        {/* Brand */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <div className="w-2 h-2 bg-orange-500 shrink-0" />
          <span className="text-xs font-bold tracking-[0.18em] uppercase text-foreground">K2 Admin</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors group",
                  active
                    ? "text-orange-500 bg-orange-500/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-orange-500" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
                {active && <ChevronRight className="h-3 w-3 ml-auto text-orange-500/60" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3 space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            View Site
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/5 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Top bar (mobile) ── */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500" />
          <span className="text-xs font-bold tracking-[0.18em] uppercase">K2 Admin</span>
          <span className="text-muted-foreground text-xs">/ {currentPage}</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute top-14 left-0 right-0 border-b border-border bg-card px-3 py-3 space-y-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(pathname, item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "text-orange-500 bg-orange-500/8"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
            <div className="pt-2 border-t border-border space-y-0.5">
              <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ExternalLink className="h-4 w-4 shrink-0" />
                View Site
              </Link>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-red-500 transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
