import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function SettingsPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage site settings and configuration
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
            <CardDescription>
              Update site name, description, and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" defaultValue="K2 Climbers" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Description</Label>
              <Textarea
                id="siteDescription"
                defaultValue="Expeditions • Summits • Stories • Community"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input id="contactEmail" type="email" defaultValue="info@k2climbers.com" />
            </div>
            <Button variant="summit">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Homepage Content</CardTitle>
            <CardDescription>
              Edit hero section and featured content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">Hero Title</Label>
              <Input id="heroTitle" defaultValue="Climb Beyond Limits" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
              <Input
                id="heroSubtitle"
                defaultValue="Expeditions • Summits • Stories • Community"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroVideo">Hero Video URL</Label>
              <Input id="heroVideo" type="url" placeholder="https://..." />
            </div>
            <Button variant="summit">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>
              Configure payment gateway and pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Input id="currency" defaultValue="PKR" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentGateway">Payment Gateway</Label>
              <Input id="paymentGateway" defaultValue="Stripe" />
            </div>
            <Button variant="summit">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
            <CardDescription>
              Manage meta tags and SEO configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Default Meta Title</Label>
              <Input id="metaTitle" defaultValue="K2 Climbers - Climb Beyond Limits" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Default Meta Description</Label>
              <Textarea
                id="metaDescription"
                defaultValue="Expeditions • Summits • Stories • Community"
                rows={3}
              />
            </div>
            <Button variant="summit">Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
