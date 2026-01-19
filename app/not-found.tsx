import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mountain } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Mountain className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          This peak doesn&apos;t exist. Let&apos;s get you back on track.
        </p>
        <Link href="/">
          <Button variant="summit">Return Home</Button>
        </Link>
      </div>
    </div>
  )
}
