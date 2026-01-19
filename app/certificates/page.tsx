"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Navbar } from "@/components/navbar"
import { CertificatesGrid } from "@/components/certificates/certificates-grid"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function CertificatesPage() {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-16">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Certificates</h1>
            <p className="text-muted-foreground mb-8">
              Sign in to view your summit certificates
            </p>
            <Link href="/auth/signin">
              <Button variant="summit">Sign In</Button>
            </Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">My Certificates</h1>
            <p className="text-xl text-muted-foreground">
              Your digital summit achievement certificates
            </p>
          </div>

          <CertificatesGrid />
        </div>
      </main>
    </>
  )
}
