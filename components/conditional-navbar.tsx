"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"

export function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Hide main navbar on dashboard pages and auth pages
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/auth")) {
    return null
  }
  
  return <Navbar />
}
