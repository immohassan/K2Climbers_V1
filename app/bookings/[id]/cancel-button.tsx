"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, AlertTriangle } from "lucide-react"
import toast from "react-hot-toast"

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      })
      if (res.ok) {
        toast.success("Booking cancelled")
        setOpen(false)
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to cancel booking")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-1 border border-red-500/40 text-red-500 hover:bg-red-500/10 py-3 text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2"
      >
        <X className="h-4 w-4" />
        Cancel Booking
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="w-full max-w-sm bg-background border border-border shadow-2xl">
            <div className="px-5 py-4 border-b border-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="font-black text-sm">Cancel this booking?</p>
                <p className="text-xs text-muted-foreground mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your booking will be marked as <span className="font-semibold text-foreground">Cancelled</span> and any reserved slot capacity will be released. If you have any questions, contact us before cancelling.
              </p>
            </div>
            <div className="px-5 py-4 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 border border-border py-2.5 text-sm font-semibold hover:border-orange-500/50 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-2.5 text-sm font-semibold transition-colors"
              >
                {loading ? "Cancelling…" : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
