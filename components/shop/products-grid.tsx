import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Calendar, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  name: string
  slug: string
  description: string
  category: string
  price: number
  rentalPrice: number | null
  securityDeposit: number | null
  images: string[]
  isRentable: boolean
  inStock: boolean
}

export function ProductsGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">No products available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          {product.images && product.images.length > 0 && (
            <div
              className="h-64 bg-cover bg-center"
              style={{ backgroundImage: `url(${product.images[0]})` }}
            />
          )}
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <CardTitle className="line-clamp-2">{product.name}</CardTitle>
              <Badge variant="outline">{product.category}</Badge>
            </div>
            <CardDescription className="line-clamp-3">
              {product.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Purchase Price</span>
                <span className="text-xl font-bold">{formatCurrency(product.price)}</span>
              </div>
              {product.isRentable && product.rentalPrice && (
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      Rental (per day)
                    </div>
                    {product.securityDeposit && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Security deposit: {formatCurrency(product.securityDeposit)}
                      </div>
                    )}
                  </div>
                  <span className="text-lg font-semibold text-glacier-400">
                    {formatCurrency(product.rentalPrice)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Link href={`/shop/${product.slug}`} className="flex-1">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
            {product.isRentable && (
              <Button variant="summit" className="flex-1">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Rent
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
