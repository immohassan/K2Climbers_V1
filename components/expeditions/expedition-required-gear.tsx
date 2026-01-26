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
              className="hover:bg-card transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className=" text-sm sm:text-base break-words">{gear.product.name}</h3>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* {gear.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )} */}
                      {/* {gear.quantity > 1 && (
                        <Badge variant="outline" className="text-xs">
                          Qty: {gear.quantity}
                        </Badge>
                      )} */}
                    </div>
                  </div>
                  {/* <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <span className="capitalize">{gear.product.category.toLowerCase().replace("_", " ")}</span>
                    {gear.product.price > 0 && (
                      <span className="font-medium text-foreground">
                        {formatCurrency(gear.product.price)}
                      </span>
                    )}
                    {gear.product.rentalPrice && (
                      <span className="text-glacier-400 whitespace-nowrap">
                        Rent: {formatCurrency(gear.product.rentalPrice)}/day
                      </span>
                    )}
                  </div> */}
                </div>
                {/* <Link href={`/shop/${gear.product.slug}`} className="flex-shrink-0">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <span className="hidden sm:inline">View Product</span>
                    <span className="sm:hidden">View</span>
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </Link> */}
              </div>
            </div>
          ))}
        </div>
        {/* <div className="mt-6 pt-6 border-t">
          <Link href="/shop">
            <Button variant="summit" className="w-full">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Browse All Gear
            </Button>
          </Link>
        </div> */}
      </CardContent>
    </Card>
  )
}
