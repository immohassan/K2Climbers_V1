"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"

export function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Hide main navbar on dashboard pages, auth pages, and certificate print pages
  if (
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/auth") ||
    pathname?.endsWith("/print")
  ) {
    return null
  }
  
  return <Navbar />
}
