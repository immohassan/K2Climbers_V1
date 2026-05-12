import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"

  if (!isAdmin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      {/* Offset for fixed sidebar on desktop, top bar on mobile */}
      <div className="lg:pl-56">
        <div className="px-4 sm:px-6 py-6 md:py-8 max-w-7xl">
          {children}
        </div>
      </div>
    </div>
  )
}
