import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ExpeditionsTable } from "@/components/dashboard/expeditions-table"

export default function ExpeditionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expeditions</h1>
          <p className="text-muted-foreground">
            Manage all mountaineering expeditions
          </p>
        </div>
        <Link href="/dashboard/expeditions/new">
          <Button variant="summit">
            <Plus className="h-4 w-4 mr-2" />
            New Expedition
          </Button>
        </Link>
      </div>

      <ExpeditionsTable />
    </div>
  )
}
