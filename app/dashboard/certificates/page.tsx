import { CertificatesTable } from "@/components/dashboard/certificates-table"

export default function CertificatesPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Certificates</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage and issue digital summit certificates
        </p>
      </div>

      <CertificatesTable />
    </div>
  )
}
