import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { CheckCircle2, Mountain, Clock, MapPin, Users, ArrowRight, Calendar, Tag } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { CancelBookingButton } from "./cancel-button"

async function getBooking(id: string, userId: string) {
  try {
    return await prisma.booking.findFirst({
      where: { id, userId },
      include: {
        expedition: {
          select: {
            title: true,
            slug: true,
            altitude: true,
            duration: true,
            location: true,
            heroImage: true,
            difficulty: true,
          },
        },
        slot: {
          select: { startDate: true, endDate: true, label: true },
        },
        coupon: {
          select: { code: true, discountType: true, discountValue: true },
        },
      },
    })
  } catch {
    return null
  }
}

export default async function BookingConfirmationPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")

  const booking = await getBooking(params.id, session.user.id)
  if (!booking) notFound()

  const exp = booking.expedition

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 max-w-3xl">

          {/* Success header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-5">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-2">Booking Confirmed</p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">You&apos;re Going Climbing</h1>
            <p className="text-muted-foreground text-sm mt-3 max-w-md">
              Your booking has been received and is pending confirmation. We&apos;ll be in touch shortly with next steps.
            </p>
          </div>

          {/* Booking summary card */}
          <div className="border border-border mb-6">
            {/* Hero image strip */}
            {exp.heroImage && (
              <div
                className="h-36 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${exp.heroImage})` }}
              >
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute bottom-3 left-5">
                  <span className="text-[10px] font-bold tracking-widest uppercase bg-black/40 text-white/80 px-2 py-1">
                    {exp.difficulty}
                  </span>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="px-6 py-5 border-b border-border">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-500 mb-1">Expedition</p>
              <h2 className="text-xl font-black">{exp.title}</h2>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground font-mono mt-2">
                <span className="flex items-center gap-1.5"><Mountain className="h-3 w-3" />{exp.altitude.toLocaleString()}m</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{exp.duration} days</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{exp.location}</span>
              </div>
            </div>

            {/* Booking info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border border-b border-border">
              {[
                { label: "Booking Ref", value: booking.id.slice(0, 8).toUpperCase() },
                { label: "People", value: `${booking.numberOfPeople} person${booking.numberOfPeople > 1 ? "s" : ""}` },
                { label: "Total", value: formatCurrency(booking.totalAmount) },
                { label: "Status", value: booking.status },
              ].map(({ label, value }) => (
                <div key={label} className="bg-background px-4 py-4">
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1">{label}</p>
                  <p className={`text-sm font-black ${label === "Status" ? (booking.status === "CONFIRMED" ? "text-green-500" : "text-yellow-500") : label === "Total" ? "text-orange-500" : ""}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Discount row — only shown when a coupon was applied */}
            {booking.discountAmount > 0 && booking.coupon && (
              <div className="px-6 py-3 border-b border-border flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-green-600">
                  <Tag className="h-3.5 w-3.5" />
                  Coupon <span className="font-mono font-bold">{booking.coupon.code}</span>
                  {booking.coupon.discountType === "PERCENTAGE" && (
                    <span className="text-xs text-muted-foreground">({booking.coupon.discountValue}% off)</span>
                  )}
                </span>
                <span className="font-semibold text-green-600">−{formatCurrency(booking.discountAmount)}</span>
              </div>
            )}

            {/* Slot dates */}
            {booking.slot && (
              <div className="px-6 py-4 border-b border-border flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-orange-500 shrink-0" />
                <span>
                  {booking.slot.label && <span className="font-bold text-orange-500 mr-1">{booking.slot.label} · </span>}
                  <span className="font-semibold">
                    {new Date(booking.slot.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    {" – "}
                    {new Date(booking.slot.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </span>
              </div>
            )}

            {/* Booked on */}
            <div className="px-6 py-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Booked on {formatDate(booking.createdAt)}
            </div>
          </div>

          {/* What's next */}
          <div className="border border-border mb-8">
            <div className="px-6 py-4 border-b border-border">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500">What Happens Next</p>
            </div>
            <div className="divide-y divide-border">
              {[
                { step: "1", text: "Our team reviews your booking and contacts you within 24 hours." },
                { step: "2", text: "You'll receive a detailed pre-expedition briefing pack via email." },
                { step: "3", text: "Payment and documentation will be arranged before departure." },
                { step: "4", text: "Final logistics and meeting point details shared 2 weeks before." },
              ].map(({ step, text }) => (
                <div key={step} className="px-6 py-4 flex items-start gap-4">
                  <span className="text-[10px] font-black text-orange-500 mt-0.5 w-4 shrink-0">{step}</span>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/expeditions/${exp.slug}`}
              className="flex-1 border border-border py-3 text-sm font-semibold text-center hover:bg-muted/50 transition-colors"
            >
              View Expedition
            </Link>
            <Link
              href="/profile"
              className="flex-1 bg-orange-500 hover:bg-orange-400 text-white py-3 text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2"
            >
              My Profile &amp; Bookings <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Cancel — only available while PENDING */}
          {booking.status === "PENDING" && (
            <div className="flex mt-3">
              <CancelBookingButton bookingId={booking.id} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
