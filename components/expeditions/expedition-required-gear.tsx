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

export function ExpeditionRequiredGear({
  requiredGear,
  requiredEquipment,
}: {
  requiredGear: RequiredGear[]
  requiredEquipment?: string | null
}) {
  // Prefer the new free-text field; fall back to legacy product list
  const hasText = requiredEquipment && requiredEquipment.trim().length > 0
  const hasGear = requiredGear.length > 0

  if (!hasText && !hasGear) return null

  const items = hasText
    ? requiredEquipment!.split("\n").map((l) => l.trim()).filter(Boolean)
    : null

  return (
    <div className="border border-border p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-5">
        <ShoppingBag className="h-3.5 w-3.5" />
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500">Required Gear &amp; Equipment</p>
      </div>

      {items ? (
        <ul className="divide-y divide-border">
          {items.map((item, i) => (
            <li key={i} className="py-2.5 first:pt-0 last:pb-0 text-sm flex items-start gap-2.5">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
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
      )}
    </div>
  )
}
