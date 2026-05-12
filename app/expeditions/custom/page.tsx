"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Mountain, Calendar, Users, MapPin, CheckCircle2, ArrowRight } from "lucide-react"
import { Footer } from "@/components/footer"

const SUPPORT_LEVELS = [
  { value: "BASIC", label: "Basic", desc: "Minimal support, self-guided" },
  { value: "STANDARD", label: "Standard", desc: "Guide + base camp support" },
  { value: "FULL", label: "Full", desc: "Complete expedition support" },
  { value: "LUXURY", label: "Luxury", desc: "Premium experience" },
]

const NEXT_STEPS = [
  "Our expedition planning team reviews your request",
  "We contact you within 48 hours to discuss details",
  "We create a customised itinerary and quote",
  "Once approved, we handle all logistics and planning",
]

export default function CustomExpeditionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    peakName: "",
    location: "",
    preferredDates: "",
    groupSize: "",
    supportLevel: "",
    requiredGear: "",
    specialRequests: "",
  })

  const set = (key: keyof typeof formData) => (value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      router.push(`/auth/signin?callbackUrl=/expeditions/custom`)
      return
    }

    if (!formData.supportLevel) {
      toast.error("Please select a support level")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/custom-expedition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSubmitted(true)
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to submit request")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <main className="min-h-screen pt-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 max-w-5xl">

          {/* Page header */}
          <div className="mb-10 md:mb-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-3">Expeditions</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Custom Expedition
            </h1>
            <p className="text-muted-foreground mt-3 text-sm sm:text-base max-w-xl">
              Tell us your dream climb and we&apos;ll build a tailored expedition around you.
            </p>
          </div>

          {submitted ? (
            /* ── Success state ── */
            <div className="border border-border max-w-2xl">
              <div className="px-6 py-10 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black mb-2">Request Submitted</h2>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    We&apos;ve received your custom expedition request for <strong>{formData.peakName}</strong>. Our team will reach out within 48 hours.
                  </p>
                </div>
                <div className="w-full border-t border-border pt-6 mt-2 space-y-3 text-left">
                  {NEXT_STEPS.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-[10px] font-black text-orange-500 mt-0.5 w-4 shrink-0">{i + 1}</span>
                      <span className="text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 w-full pt-2">
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setFormData({ peakName: "", location: "", preferredDates: "", groupSize: "", supportLevel: "", requiredGear: "", specialRequests: "" })
                    }}
                    className="flex-1 border border-border py-2.5 text-sm font-semibold hover:bg-muted/50 transition-colors"
                  >
                    Submit Another
                  </button>
                  <button
                    onClick={() => router.push("/expeditions")}
                    className="flex-1 bg-orange-500 hover:bg-orange-400 text-white py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    Browse Expeditions <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── Form ── */
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="border border-border">
                  {/* Section: Peak */}
                  <div className="px-6 py-5 border-b border-border">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-500 mb-4">The Climb</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="peakName" className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Mountain className="h-3 w-3" /> Peak Name *
                        </Label>
                        <Input id="peakName" value={formData.peakName} onChange={(e) => set("peakName")(e.target.value)} placeholder="e.g., K2, Nanga Parbat" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="location" className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" /> Location *
                        </Label>
                        <Input id="location" value={formData.location} onChange={(e) => set("location")(e.target.value)} placeholder="e.g., Gilgit-Baltistan, Pakistan" required />
                      </div>
                    </div>
                  </div>

                  {/* Section: Logistics */}
                  <div className="px-6 py-5 border-b border-border">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-500 mb-4">Logistics</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="preferredDates" className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" /> Preferred Start Date
                        </Label>
                        <Input id="preferredDates" type="date" value={formData.preferredDates} onChange={(e) => set("preferredDates")(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="groupSize" className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Users className="h-3 w-3" /> Group Size *
                        </Label>
                        <Input id="groupSize" type="number" min="1" max="50" value={formData.groupSize} onChange={(e) => set("groupSize")(e.target.value)} placeholder="Number of people" required />
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Support Level *</Label>
                      <div className="grid sm:grid-cols-2 gap-2 mt-2">
                        {SUPPORT_LEVELS.map((level) => (
                          <button
                            key={level.value}
                            type="button"
                            onClick={() => set("supportLevel")(level.value)}
                            className={`text-left px-4 py-3 border transition-colors ${
                              formData.supportLevel === level.value
                                ? "border-orange-500 bg-orange-500/5"
                                : "border-border hover:border-orange-500/40 hover:bg-muted/30"
                            }`}
                          >
                            <p className={`text-sm font-semibold ${formData.supportLevel === level.value ? "text-orange-500" : ""}`}>
                              {level.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{level.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Section: Details */}
                  <div className="px-6 py-5 border-b border-border">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-500 mb-4">Additional Details</p>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="requiredGear" className="text-xs uppercase tracking-wider text-muted-foreground">Required Gear</Label>
                        <Textarea id="requiredGear" value={formData.requiredGear} onChange={(e) => set("requiredGear")(e.target.value)} placeholder="Any specific gear requirements or equipment you need provided..." rows={3} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="specialRequests" className="text-xs uppercase tracking-wider text-muted-foreground">Special Requests</Label>
                        <Textarea id="specialRequests" value={formData.specialRequests} onChange={(e) => set("specialRequests")(e.target.value)} placeholder="Dietary requirements, medical considerations, accommodation preferences..." rows={3} />
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="px-6 py-5 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="flex-1 border border-border py-2.5 text-sm font-semibold hover:bg-muted/50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white py-2.5 text-sm font-semibold transition-colors"
                    >
                      {loading ? "Submitting..." : session ? "Submit Request" : "Sign In to Submit"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                <div className="border border-border px-5 py-5">
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-4">What Happens Next</p>
                  <div className="space-y-4">
                    {NEXT_STEPS.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-[10px] font-black text-orange-500 mt-0.5 w-4 shrink-0">{i + 1}</span>
                        <p className="text-sm text-muted-foreground leading-snug">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-border px-5 py-5">
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2">Response Time</p>
                  <p className="text-2xl font-black">48 hrs</p>
                  <p className="text-xs text-muted-foreground mt-1">Our team responds to all custom requests within two business days.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
