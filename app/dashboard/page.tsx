import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentBookings } from "@/components/dashboard/recent-bookings"
import { TopExpeditions } from "@/components/dashboard/top-expeditions"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-2">Admin</p>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Overview</h1>
      </div>

      <DashboardStats />

      <div className="grid lg:grid-cols-2 gap-6">
        <RecentBookings />
        <TopExpeditions />
      </div>
    </div>
  )
}
