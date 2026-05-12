import { CreditCard, RotateCcw } from "lucide-react"

export function ExpeditionPolicies({
  paymentPolicy,
  refundPolicy,
}: {
  paymentPolicy?: string | null
  refundPolicy?: string | null
}) {
  if (!paymentPolicy && !refundPolicy) return null

  return (
    <div className="space-y-4">
      {paymentPolicy && (
        <div className="border border-border p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500">Payment Procedure</p>
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {paymentPolicy}
          </div>
        </div>
      )}

      {refundPolicy && (
        <div className="border border-border p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 ">Refund Policy</p>
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {refundPolicy}
          </div>
        </div>
      )}
    </div>
  )
}
