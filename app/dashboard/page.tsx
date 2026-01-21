import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentBookings } from "@/components/dashboard/recent-bookings"
import { TopExpeditions } from "@/components/dashboard/top-expeditions"

export default function DashboardPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage expeditions, bookings, and community
        </p>
      </div>

      <DashboardStats />
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <RecentBookings />
        <TopExpeditions />
      </div>
    </div>
  )
}
