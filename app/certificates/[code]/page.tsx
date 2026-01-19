import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { CertificateView } from "@/components/certificates/certificate-view"
import { prisma } from "@/lib/prisma"

async function getCertificate(code: string) {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { verificationCode: code },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })
    return certificate
  } catch (error) {
    console.error("Error fetching certificate:", error)
    return null
  }
}

export default async function CertificatePage({
  params,
}: {
  params: { code: string }
}) {
  const certificate = await getCertificate(params.code)

  if (!certificate) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4 py-12">
          <CertificateView certificate={certificate} />
        </div>
      </main>
    </>
  )
}
