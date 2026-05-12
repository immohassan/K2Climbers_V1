import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CertificatePrint } from "@/components/certificates/certificate-print"

async function getCertificate(code: string) {
  try {
    return await prisma.certificate.findUnique({
      where: { verificationCode: code },
      include: {
        user: { select: { name: true, image: true } },
      },
    })
  } catch {
    return null
  }
}

export default async function CertificatePrintPage({
  params,
}: {
  params: { code: string }
}) {
  const certificate = await getCertificate(params.code)
  if (!certificate) notFound()

  return <CertificatePrint certificate={certificate} />
}
