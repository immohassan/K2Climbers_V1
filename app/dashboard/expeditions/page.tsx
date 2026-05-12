import Link from "next/link"
import { Plus } from "lucide-react"
import { ExpeditionsTable } from "@/components/dashboard/expeditions-table"

export default function ExpeditionsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-2">Admin</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Expeditions</h1>
        </div>
        <Link
          href="/dashboard/expeditions/new"
          className="flex items-center gap-2 text-sm font-semibold bg-orange-500 hover:bg-orange-400 text-white px-4 py-2.5 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Expedition
        </Link>
      </div>

      <ExpeditionsTable />
    </div>
  )
}
