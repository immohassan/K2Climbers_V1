import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Custom Expedition",
  description:
    "Plan a custom mountaineering expedition in Pakistan with K2 Climbers. Tell us your dream peak and we'll build a tailored itinerary — K2, Nanga Parbat, or any summit you choose.",
  alternates: { canonical: "/expeditions/custom" },
  openGraph: {
    title: "Custom Expedition | K2 Climbers",
    description:
      "Plan a bespoke mountaineering expedition in Pakistan. Tell us your dream peak and we'll create a tailored itinerary.",
    url: "/expeditions/custom",
  },
}

export default function CustomExpeditionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
