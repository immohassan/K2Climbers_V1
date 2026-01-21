import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ProductsTable } from "@/components/dashboard/products-table"

export default function ProductsPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage shop inventory and rentals
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button variant="summit" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Product
          </Button>
        </Link>
      </div>

      <ProductsTable />
    </div>
  )
}
