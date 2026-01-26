"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function CommunityPageClient() {
  return (
    <Link href="/community/new">
      <Button variant="summit" className="w-full sm:w-auto">
        <Plus className="h-4 w-4 mr-2" />
        Create Post
      </Button>
    </Link>
  )
}
