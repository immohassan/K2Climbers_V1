import { CertificateIssuance } from "@/components/dashboard/certificate-issuance"
import { CertificatesTable } from "@/components/dashboard/certificates-table"

export default function CertificatesPage() {
  return (
    <div className="space-y-12">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-2">Admin</p>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Summit Records & Certificates</h1>
      </div>

      {/* Issuance flow */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold">Issue Certificate</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Search an expedition, pick a slot, then generate certificates for the climbers in that slot.
          </p>
        </div>
        <CertificateIssuance />
      </div>

      {/* All issued certificates */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">All Issued Certificates</h2>
        <CertificatesTable />
      </div>
    </div>
  )
}
