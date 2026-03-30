import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContactForm } from "@/components/contact/contact-form"


export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with K2 Climbers to plan your Pakistan mountain expedition. Call +92 335 5428818 or email info@k2climbers.com. Office in Rawalpindi.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact K2 Climbers",
    description:
      "Get in touch to plan your Pakistan mountain expedition. Call or email our Rawalpindi office.",
    url: "/contact",
  },
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 pb-12">
        <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20">
          <div className="mx-auto max-w-2xl">
            <h1 className="mb-2 text-center text-3xl font-bold sm:text-4xl md:text-5xl">
              Contact Us
            </h1>
            <p className="mb-10 text-center text-muted-foreground">
              Have a question or want to plan your next expedition? Get in touch.
            </p>
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
