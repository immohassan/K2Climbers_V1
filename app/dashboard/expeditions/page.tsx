import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ExpeditionsTable } from "@/components/dashboard/expeditions-table"

export default function ExpeditionsPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Expeditions</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage all mountaineering expeditions
          </p>
        </div>
        <Link href="/dashboard/expeditions/new">
          <Button variant="summit" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Expedition
          </Button>
        </Link>
      </div>

      <ExpeditionsTable />
    </div>
  )
}
