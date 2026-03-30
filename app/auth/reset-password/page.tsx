"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Mountain, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm border border-border bg-background p-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="font-black text-base">Invalid Reset Link</p>
          <p className="text-sm text-muted-foreground">This password reset link is missing or invalid.</p>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-orange-500 hover:text-orange-400 font-semibold transition-colors"
          >
            Request a new link
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error("Passwords do not match")
      return
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setDone(true)
        setTimeout(() => router.push("/auth/signin"), 3000)
      } else {
        toast.error(data.error || "Something went wrong")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <Link href="/" className="flex items-center gap-2.5 mb-8 group">
          <Mountain className="h-7 w-7 text-summit group-hover:text-orange-400 transition-colors" />
          <span className="text-xl font-black tracking-tight">K2 Climbers</span>
        </Link>
        <div className="w-full max-w-sm border border-border bg-background p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="font-black text-base">Password Updated</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your password has been changed. Redirecting you to sign in…
            </p>
          </div>
          <Link
            href="/auth/signin"
            className="text-sm text-orange-500 hover:text-orange-400 font-semibold transition-colors"
          >
            Sign in now
          </Link>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-black">Set New Password</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-xs uppercase tracking-wider text-muted-foreground">
              Confirm Password
            </Label>
            <Input
              id="confirm"
              type={showPassword ? "text" : "password"}
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
            {confirm && password !== confirm && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (!!confirm && password !== confirm)}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white py-2.5 text-sm font-semibold transition-colors"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
