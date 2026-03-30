"use client"

import { useState } from "react"
import Link from "next/link"
import { Mountain, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setSent(true)
      } else {
        toast.error(data.error || "Something went wrong")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <Mountain className="h-7 w-7 text-summit group-hover:text-orange-400 transition-colors" />
        <span className="text-xl font-black tracking-tight">K2 Climbers</span>
      </Link>

      <div className="w-full max-w-sm border border-border bg-background">
        <div className="px-6 py-5 border-b border-border">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-500 mb-1">Account</p>
          <h1 className="text-2xl font-black">Forgot Password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="px-6 py-8 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="font-black text-base">Check your email</p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset link shortly.
              </p>
            </div>
            <Link
              href="/auth/signin"
              className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-400 transition-colors font-semibold mt-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white py-2.5 text-sm font-semibold transition-colors"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="px-6 pb-5 border-t border-border pt-4 text-center">
              <Link
                href="/auth/signin"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
