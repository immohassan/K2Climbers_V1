import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendCertificateRevokedEmail } from "@/lib/email"
import { revalidatePath } from "next/cache"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cert = await prisma.certificate.findUnique({
      where: { id: params.id },
      include: { user: { select: { name: true, email: true } } },
    })
    if (!cert) return NextResponse.json({ error: "Certificate not found" }, { status: 404 })

    await prisma.certificate.delete({ where: { id: params.id } })

    revalidatePath("/dashboard/certificates")
    revalidatePath("/profile")

    if (cert.user?.email) {
      sendCertificateRevokedEmail({
        to: cert.user.email,
        name: cert.user.name ?? "",
        peakName: cert.peakName,
        expeditionTitle: cert.expeditionTitle,
        altitude: cert.altitude,
      }).catch((err) => console.error("Failed to send certificate revoked email:", err))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting certificate:", error)
    return NextResponse.json({ error: "Failed to delete certificate" }, { status: 500 })
  }
}
