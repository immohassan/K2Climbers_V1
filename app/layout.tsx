import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/providers/session-provider"
import { Toaster } from "react-hot-toast"
import { ProgressBar } from "@/components/progress-bar"
import { Navbar } from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "K2 Climbers - Climb Beyond Limits",
  description: "Expeditions • Summits • Stories • Community",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <ProgressBar />
            <Navbar />
            {children}
            <Toaster position="top-right" />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
