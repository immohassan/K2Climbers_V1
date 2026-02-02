import { HeroSection } from "@/components/home/hero-section"
import { AboutUsSection } from "@/components/home/about-us-section"
import { HomeVideoSection } from "@/components/home/home-video-section"
import { FeaturedExpeditions } from "@/components/home/featured-expeditions"
import { StatsSection } from "@/components/home/stats-section"
import { FeaturedClimbers } from "@/components/home/featured-climbers"
import { Footer } from "@/components/footer"

// Always fetch fresh data so new expeditions show up on deploy (no static cache)
export const dynamic = "force-dynamic"

export default function HomePage() {
  return (
    <>
      <main className="min-h-screen">
        <HeroSection />
        <StatsSection />
        <AboutUsSection />
        <FeaturedExpeditions />
        <FeaturedClimbers />
        <HomeVideoSection />
      </main>
      <Footer />
    </>
  )
}
