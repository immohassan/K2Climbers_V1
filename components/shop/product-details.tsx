import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Calendar, DollarSign, Package } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  rentalPrice: number | null
  securityDeposit: number | null
  images: string[]
  isRentable: boolean
  inStock: boolean
  stockQuantity: number | null
  specifications: any
  expeditionGear: Array<{
    expedition: {
      id: string
      title: string
      slug: string
    }
  }>
}

export function ProductDetails({ product }: { product: Product }) {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Product Images */}
      <div className="space-y-4">
        {product.images && product.images.length > 0 ? (
          <>
            <div className="aspect-square rounded-lg overflow-hidden bg-card relative">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1).map((image, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-card relative">
                    <Image
                      src={image}
                      alt={`${product.name} ${idx + 2}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 25vw, 12.5vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="aspect-square rounded-lg bg-card flex items-center justify-center">
            <Package className="h-24 w-24 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{product.category}</Badge>
            {product.isRentable && (
              <Badge className="bg-glacier-500">Available for Rent</Badge>
            )}
            {product.inStock ? (
              <Badge className="bg-green-500">In Stock</Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>Purchase Price</span>
              </div>
              <span className="text-3xl font-bold">{formatCurrency(product.price)}</span>
            </div>
            {product.isRentable && product.rentalPrice && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>Rental (per day)</span>
                  </div>
                  <span className="text-2xl font-semibold text-glacier-400">
                    {formatCurrency(product.rentalPrice)}
                  </span>
                </div>
                {product.securityDeposit && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Security deposit: {formatCurrency(product.securityDeposit)}
                  </p>
                )}
              </div>
            )}
            {product.stockQuantity !== null && (
              <p className="text-sm text-muted-foreground">
                Stock: {product.stockQuantity} available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Specifications */}
        {product.specifications && (
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="text-muted-foreground capitalize">{key}:</dt>
                    <dd className="font-medium">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Used in Expeditions */}
        {product.expeditionGear.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Used in Expeditions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {product.expeditionGear.map((gear) => (
                  <li key={gear.expedition.id}>
                    <Link
                      href={`/expeditions/${gear.expedition.slug}`}
                      className="text-glacier-400 hover:underline"
                    >
                      {gear.expedition.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="outline" size="lg" className="flex-1">
            Add to Cart
          </Button>
          {product.isRentable && (
            <Button variant="summit" size="lg" className="flex-1">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Rent Now
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
