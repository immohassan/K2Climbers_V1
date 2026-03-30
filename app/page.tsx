import type { Metadata } from "next"
import { HeroSection } from "@/components/home/hero-section"
import { AboutUsSection } from "@/components/home/about-us-section"
import { HomeVideoSection } from "@/components/home/home-video-section"
import { FeaturedExpeditions } from "@/components/home/featured-expeditions"
import { StatsSection } from "@/components/home/stats-section"
import { FeaturedClimbers } from "@/components/home/featured-climbers"
import { GoogleReviewsSection } from "@/components/home/google-reviews-section"
import { MountainRangesSection } from "@/components/home/mountain-ranges-section"
import { Footer } from "@/components/footer"

export const revalidate = 3600 // revalidate every hour

export const metadata: Metadata = {
  title: "K2 Climbers — Pakistan Mountain Expeditions & Trekking",
  description:
    "Join K2 Climbers for guided mountaineering expeditions and treks in Pakistan. K2, Nanga Parbat, Rakaposhi, and more across the Karakoram, Himalaya, and Hindu Kush.",
  alternates: { canonical: "/" },
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "TouristInformationCenter",
  name: "K2 Climbers",
  url: "https://www.k2climbers.com",
  logo: "https://www.k2climbers.com/logo.png",
  description:
    "Pakistan's premier mountaineering expedition and adventure trekking company operating in the Karakoram, Himalaya, and Hindu Kush ranges.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Office No 226, 2nd Floor, Dubai Plaza, 6th Road",
    addressLocality: "Rawalpindi",
    postalCode: "46000",
    addressCountry: "PK",
  },
  telephone: "+923355428818",
  email: "info@k2climbers.com",
  sameAs: [
    "https://www.facebook.com/k2climbers",
    "https://www.instagram.com/k2climbers",
  ],
  areaServed: "Pakistan",
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <main className="min-h-screen pt-16">
        <HeroSection />
        <StatsSection />
        <FeaturedExpeditions />
        <AboutUsSection />
        <MountainRangesSection />
        <FeaturedClimbers />
        <GoogleReviewsSection />
        <HomeVideoSection />
      </main>
      <Footer />
    </>
  )
}
