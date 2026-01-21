"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import toast from "react-hot-toast"

interface Product {
  id: string
  name: string
  slug: string
  category: string
  price: number
  rentalPrice: number | null
  isRentable: boolean
  inStock: boolean
  stockQuantity: number | null
}

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products")
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Product deleted")
        fetchProducts()
      } else {
        toast.error("Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product")
    }
  }

  if (loading) {
    return <Card><CardContent className="p-6">Loading...</CardContent></Card>
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Name</th>
                <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Category</th>
                <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Price</th>
                <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Rental</th>
                <th className="text-left p-3 md:p-4 font-semibold text-xs md:text-sm">Stock</th>
                <th className="text-right p-3 md:p-4 font-semibold text-xs md:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No products found. Create your first product!
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-card">
                    <td className="p-3 md:p-4">
                      <div className="font-medium text-xs md:text-sm">{product.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px] md:max-w-none">{product.slug}</div>
                    </td>
                    <td className="p-3 md:p-4 text-xs md:text-sm">{product.category}</td>
                    <td className="p-3 md:p-4 text-xs md:text-sm">{formatCurrency(product.price)}</td>
                    <td className="p-3 md:p-4 text-xs md:text-sm">
                      {product.isRentable && product.rentalPrice ? (
                        <span className="text-glacier-400">{formatCurrency(product.rentalPrice)}/day</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3 md:p-4 text-xs md:text-sm">
                      {product.inStock ? (
                        <span className="text-green-400">
                          {product.stockQuantity !== null ? `${product.stockQuantity} units` : "In Stock"}
                        </span>
                      ) : (
                        <span className="text-red-400">Out of Stock</span>
                      )}
                    </td>
                    <td className="p-3 md:p-4">
                      <div className="flex items-center justify-end gap-1 md:gap-2">
                        <Link href={`/shop/${product.slug}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                            <Eye className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/products/${product.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 md:h-10 md:w-10"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
