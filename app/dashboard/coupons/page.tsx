import { CouponsTable } from "@/components/dashboard/coupons-table"

export default function CouponsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-2">Admin</p>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Coupons</h1>
      </div>

      <CouponsTable />
    </div>
  )
}
