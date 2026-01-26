import { ProductsGrid } from "@/components/shop/products-grid"
import { prisma } from "@/lib/prisma"

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { inStock: true },
      orderBy: { createdAt: "desc" },
    })
    return products
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export default async function ShopPage() {
  const products = await getProducts()

  return (
    <main className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Shop & Rent</h1>
          <p className="text-xl text-muted-foreground">
            Premium mountaineering equipment for purchase or rental
          </p>
        </div>

        <ProductsGrid products={products} />
      </div>
    </main>
  )
}
