import { HeroSection } from "@/components/home/hero-section"
import { FeaturedExpeditions } from "@/components/home/featured-expeditions"
import { StatsSection } from "@/components/home/stats-section"
import { FeaturedClimbers } from "@/components/home/featured-climbers"
import { CommunityStories } from "@/components/home/community-stories"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <>
      <main className="min-h-screen">
        <HeroSection />
        <StatsSection />
        <FeaturedExpeditions />
        <FeaturedClimbers />
        <CommunityStories />
      </main>
      <Footer />
    </>
  )
}
