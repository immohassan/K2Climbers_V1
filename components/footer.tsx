import Link from "next/link"
import { Mountain } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Mountain className="h-6 w-6 text-summit" />
              <span className="text-xl font-bold">K2 Climbers</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Climb Beyond Limits. Join our community of mountaineers and adventurers.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Expeditions</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/expeditions" className="text-muted-foreground hover:text-foreground transition">
                  All Expeditions
                </Link>
              </li>
              <li>
                <Link href="/expeditions/custom" className="text-muted-foreground hover:text-foreground transition">
                  Custom Expedition
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/community" className="text-muted-foreground hover:text-foreground transition">
                  Community Feed
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-foreground transition">
                  Shop & Rent
                </Link>
              </li>
              <li>
                <Link href="/certificates" className="text-muted-foreground hover:text-foreground transition">
                  Certificates
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} K2 Climbers. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
