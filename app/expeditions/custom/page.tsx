"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Mountain, Calendar, Users, MapPin } from "lucide-react"

export default function CustomExpeditionPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    peakName: "",
    location: "",
    preferredDates: "",
    groupSize: "",
    supportLevel: "",
    requiredGear: "",
    specialRequests: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      router.push("/auth/signin")
      return
    }

    setLoading(true)
    // In a real app, this would send to an API endpoint
    setTimeout(() => {
      toast.success("Custom expedition request submitted! We'll contact you soon.")
      setLoading(false)
      setFormData({
        peakName: "",
        location: "",
        preferredDates: "",
        groupSize: "",
        supportLevel: "",
        requiredGear: "",
        specialRequests: "",
      })
    }, 1000)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Custom Expedition Builder</h1>
              <p className="text-xl text-muted-foreground">
                Create your dream mountaineering adventure tailored to your needs
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Expedition Details</CardTitle>
                <CardDescription>
                  Fill in the details below and our team will create a custom expedition plan for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="peakName">
                        <Mountain className="h-4 w-4 inline mr-1" />
                        Peak Name *
                      </Label>
                      <Input
                        id="peakName"
                        value={formData.peakName}
                        onChange={(e) => setFormData({ ...formData, peakName: e.target.value })}
                        placeholder="e.g., K2, Everest, Denali"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Location *
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Pakistan, Nepal"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferredDates">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Preferred Dates *
                      </Label>
                      <Input
                        id="preferredDates"
                        type="date"
                        value={formData.preferredDates}
                        onChange={(e) => setFormData({ ...formData, preferredDates: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="groupSize">
                        <Users className="h-4 w-4 inline mr-1" />
                        Group Size *
                      </Label>
                      <Input
                        id="groupSize"
                        type="number"
                        min="1"
                        value={formData.groupSize}
                        onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })}
                        placeholder="Number of people"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supportLevel">Support Level *</Label>
                    <Select
                      value={formData.supportLevel}
                      onValueChange={(value) => setFormData({ ...formData, supportLevel: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select support level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BASIC">Basic - Minimal support, self-guided</SelectItem>
                        <SelectItem value="STANDARD">Standard - Guide + base camp support</SelectItem>
                        <SelectItem value="FULL">Full - Complete expedition support</SelectItem>
                        <SelectItem value="LUXURY">Luxury - Premium experience</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requiredGear">Required Gear</Label>
                    <Textarea
                      id="requiredGear"
                      value={formData.requiredGear}
                      onChange={(e) => setFormData({ ...formData, requiredGear: e.target.value })}
                      placeholder="List any specific gear requirements..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialRequests">Special Requests</Label>
                    <Textarea
                      id="specialRequests"
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      placeholder="Any special accommodations, dietary requirements, or other requests..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="summit" className="flex-1" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Request"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="mt-8 p-6 bg-card rounded-lg">
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>Our expedition planning team will review your request</li>
                <li>We'll contact you within 48 hours to discuss details</li>
                <li>We'll create a customized itinerary and quote</li>
                <li>Once approved, we'll handle all logistics and planning</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
