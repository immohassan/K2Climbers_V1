import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingBag, ExternalLink } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Required Gear & Equipment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requiredGear.map((gear) => (
            <div
              key={gear.id}
              className="border rounded-lg p-4 hover:bg-card transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{gear.product.name}</h3>
                    {gear.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                    {gear.quantity > 1 && (
                      <Badge variant="outline" className="text-xs">
                        Qty: {gear.quantity}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="capitalize">{gear.product.category.toLowerCase().replace("_", " ")}</span>
                    {gear.product.price > 0 && (
                      <span className="font-medium text-foreground">
                        {formatCurrency(gear.product.price)}
                      </span>
                    )}
                    {gear.product.rentalPrice && (
                      <span className="text-glacier-400">
                        Rent: {formatCurrency(gear.product.rentalPrice)}/day
                      </span>
                    )}
                  </div>
                </div>
                <Link href={`/shop/${gear.product.slug}`}>
                  <Button variant="outline" size="sm">
                    View Product
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t">
          <Link href="/shop">
            <Button variant="summit" className="w-full">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Browse All Gear
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
