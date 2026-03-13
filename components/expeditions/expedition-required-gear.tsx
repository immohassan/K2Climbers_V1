import { ShoppingBag } from "lucide-react"

interface RequiredGear {
  id: string
  productId: string
  quantity: number
  required: boolean
  product: {
    id: string
    name: string
    slug: string
    price: number
    rentalPrice: number | null
    category: string
    images: string[]
  }
}

export function ExpeditionRequiredGear({ requiredGear }: { requiredGear: RequiredGear[] }) {
  if (requiredGear.length === 0) {
    return null
  }

  return (
    <div className="border border-border p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-5">
        <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">Required Gear & Equipment</p>
      </div>
      <div className="divide-y divide-border">
        {requiredGear.map((gear) => (
          <div key={gear.id} className="py-3 first:pt-0 last:pb-0">
            <p className="text-sm font-semibold">{gear.product.name}</p>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">
              {gear.product.category.toLowerCase().replace("_", " ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
