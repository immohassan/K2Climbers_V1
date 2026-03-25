import { CertificatesTable } from "@/components/dashboard/certificates-table"

export default function CertificatesPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-2">Admin</p>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Certificates</h1>
      </div>

      <CertificatesTable />
    </div>
  )
}
