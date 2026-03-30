import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/providers/session-provider"
import { Toaster } from "react-hot-toast"
import { ProgressBar } from "@/components/progress-bar"
import { ConditionalNavbar } from "@/components/conditional-navbar"
import { WhatsAppWidget } from "@/components/whatsapp-widget"

const inter = Inter({ subsets: ["latin"] })

const BASE_URL = "https://www.k2climbers.com"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "K2 Climbers — Pakistan Mountain Expeditions & Trekking",
    template: "%s | K2 Climbers",
  },
  description:
    "K2 Climbers offers guided mountaineering expeditions, treks, and adventure tours across Pakistan's Karakoram, Himalaya, and Hindu Kush ranges. Book K2, Nanga Parbat, and high-altitude peak expeditions.",
  keywords: [
    "K2 expedition",
    "Pakistan mountaineering",
    "Karakoram trekking",
    "Nanga Parbat expedition",
    "Gilgit-Baltistan tours",
    "high altitude climbing",
    "Pakistan adventure tours",
    "K2 base camp trek",
    "Rakaposhi trek",
    "Himalaya expeditions",
  ],
  authors: [{ name: "K2 Climbers", url: BASE_URL }],
  creator: "K2 Climbers",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "K2 Climbers",
    title: "K2 Climbers — Pakistan Mountain Expeditions & Trekking",
    description:
      "Guided mountaineering expeditions and treks across Pakistan's greatest mountain ranges. Karakoram, Himalaya, Hindu Kush.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "K2 Climbers — Pakistan Mountain Expeditions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "K2 Climbers — Pakistan Mountain Expeditions & Trekking",
    description:
      "Guided mountaineering expeditions and treks across Pakistan's greatest mountain ranges.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <ProgressBar />
            <ConditionalNavbar />
            {children}
            <WhatsAppWidget />
            <Toaster position="top-right" />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
