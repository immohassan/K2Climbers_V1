import { NextRequest, NextResponse } from "next/server"

interface RateLimitStore {
  count: number
  resetAt: number
}

// In-memory store — resets on server restart (fine for single-instance deployments).
// For multi-instance / serverless, swap this for Redis (e.g. @upstash/ratelimit).
const store = new Map<string, RateLimitStore>()

// Prune expired entries every 5 minutes to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of Array.from(store)) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 5 * 60 * 1000)

export interface RateLimitOptions {
  /** Maximum requests allowed within the window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

/**
 * Extract the best available client identifier from the request.
 * Prefers the real IP from Vercel/proxy headers, falls back to a header combo.
 */
function getIdentifier(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  )
}

/**
 * Check rate limit for a request.
 * Returns a 429 NextResponse if the limit is exceeded, or null if the request is allowed.
 *
 * @example
 * const limited = rateLimit(request, { limit: 5, windowMs: 60_000 })
 * if (limited) return limited
 */
export function rateLimit(
  request: NextRequest,
  options: RateLimitOptions,
  /** Optional suffix to namespace limits per route within the same IP */
  namespace = ""
): NextResponse | null {
  const { limit, windowMs } = options
  const ip = getIdentifier(request)
  const key = `${ip}:${namespace}`
  const now = Date.now()

  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    // First request in this window
    store.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }

  if (entry.count >= limit) {
    const retryAfterSecs = Math.ceil((entry.resetAt - now) / 1000)
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSecs),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    )
  }

  entry.count++
  return null
}

// ─── Pre-configured limiters ────────────────────────────────────────────────

/** Signup / registration: 5 attempts per 15 minutes per IP */
export const signupLimiter = (req: NextRequest) =>
  rateLimit(req, { limit: 5, windowMs: 15 * 60 * 1000 }, "signup")

/** Login attempts: 10 per 15 minutes per IP */
export const authLimiter = (req: NextRequest) =>
  rateLimit(req, { limit: 10, windowMs: 15 * 60 * 1000 }, "auth")

/** Contact form: 5 per hour per IP */
export const contactLimiter = (req: NextRequest) =>
  rateLimit(req, { limit: 5, windowMs: 60 * 60 * 1000 }, "contact")

/** Custom expedition requests: 5 per hour per IP */
export const customExpeditionLimiter = (req: NextRequest) =>
  rateLimit(req, { limit: 5, windowMs: 60 * 60 * 1000 }, "custom-expedition")

/** Booking creation: 10 per hour per IP */
export const bookingLimiter = (req: NextRequest) =>
  rateLimit(req, { limit: 10, windowMs: 60 * 60 * 1000 }, "booking")

/** Password-sensitive endpoints: 5 per 15 minutes per IP */
export const passwordLimiter = (req: NextRequest) =>
  rateLimit(req, { limit: 5, windowMs: 15 * 60 * 1000 }, "password")

/** General API write operations: 30 per minute per IP */
export const generalWriteLimiter = (req: NextRequest) =>
  rateLimit(req, { limit: 30, windowMs: 60 * 1000 }, "write")
