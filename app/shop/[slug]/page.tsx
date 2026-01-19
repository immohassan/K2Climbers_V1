import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { ProductDetails } from "@/components/shop/product-details"
import { prisma } from "@/lib/prisma"

async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        expeditionGear: {
          include: {
            expedition: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    })
    return product
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-12">
          <ProductDetails product={product} />
        </div>
      </main>
    </>
  )
}
