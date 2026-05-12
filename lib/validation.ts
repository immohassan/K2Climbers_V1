import { z } from "zod"
import { NextResponse } from "next/server"

// ─── Helper ────────────────────────────────────────────────────────────────────

/** Parse and validate a Zod schema. Returns { data } on success or a 400 NextResponse on failure. */
export function validate<T>(schema: z.ZodSchema<T>, input: unknown):
  | { ok: true; data: T }
  | { ok: false; response: NextResponse } {
  const result = schema.safeParse(input)
  if (!result.success) {
    const message = result.error.errors
      .map((e) => `${e.path.join(".") || "body"}: ${e.message}`)
      .join(", ")
    return {
      ok: false,
      response: NextResponse.json({ error: message }, { status: 400 }),
    }
  }
  return { ok: true, data: result.data }
}

// ─── Shared primitives ─────────────────────────────────────────────────────────

const id = z.string().cuid()
const email = z.string().email().max(254).transform((v) => v.trim().toLowerCase())
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
const shortText = (max = 255) => z.string().min(1).max(max).transform((v) => v.trim())
const optionalText = (max = 255) => z.string().max(max).transform((v) => v.trim()).optional().nullable()
const slug = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers and hyphens only")
const url = z
  .string()
  .max(2048)
  .refine(
    (v) => {
      try { new URL(v); return true } catch { /* relative path */ }
      return v.startsWith("/api/images/")
    },
    { message: "Must be a valid URL or an uploaded image path" }
  )
  .optional()
  .nullable()
const positiveInt = z.number().int().positive()
const nonNegativeInt = z.number().int().min(0)
const positiveFloat = z.number().positive()

const VALID_ROLES = ["CLIMBER", "GUIDE", "ADMIN", "SUPER_ADMIN"] as const
const VALID_SUMMIT_STATUS = ["SUCCESSFUL", "FAILED", "IN_PROGRESS"] as const
const VALID_BOOKING_STATUS = ["PENDING", "CONFIRMED", "CANCELLED"] as const
const VALID_PAYMENT_STATUS = ["PENDING", "PAID", "REFUNDED"] as const
const VALID_CATEGORIES = ["SMALL_PEAKS", "TREKKING_PEAKS", "MOUNTAINEERING", "ROAD_TRIPS", "CUSTOM"] as const
const VALID_DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT", "EXTREME"] as const
const VALID_MOUNTAIN_RANGES = ["KARAKORAM", "HIMALAYA", "HINDU_KUSH"] as const
const VALID_GEAR_CATEGORIES = [
  "CLOTHING", "FOOTWEAR", "CAMPING", "CLIMBING_EQUIPMENT",
  "NAVIGATION", "SAFETY", "NUTRITION", "OTHER",
] as const

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const signupSchema = z.object({
  email,
  password,
  name: z.string().max(100).transform((v) => v.trim()).optional().nullable(),
})

// ─── Contact ───────────────────────────────────────────────────────────────────

export const contactSchema = z.object({
  name: shortText(100),
  email,
  subject: optionalText(200),
  message: z.string().min(1).max(5000).transform((v) => v.trim()),
})

// ─── Custom Expedition ─────────────────────────────────────────────────────────

export const customExpeditionSchema = z.object({
  peakName: shortText(150),
  location: shortText(200),
  preferredDates: optionalText(200),
  groupSize: z.number().int().min(1).max(200),
  supportLevel: shortText(100),
  requiredGear: optionalText(2000),
  specialRequests: optionalText(5000),
})

// ─── Booking ───────────────────────────────────────────────────────────────────

export const createBookingSchema = z.object({
  expeditionId: id,
  slotId: z.string().cuid().optional().nullable(),
  numberOfPeople: z.number().int().min(1).max(200),
  specialRequests: optionalText(2000),
  couponCode: z.string().max(50).transform((v) => v.trim().toUpperCase()).optional().nullable(),
})

export const patchBookingSchema = z.object({
  status: z.enum(VALID_BOOKING_STATUS).optional(),
  paymentStatus: z.enum(VALID_PAYMENT_STATUS).optional(),
  specialRequests: optionalText(2000),
  numberOfPeople: z.number().int().min(1).max(200).optional(),
})

// ─── Profile ───────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().max(100).transform((v) => v.trim()).optional().nullable(),
  bio: z.string().max(2000).transform((v) => v.trim()).optional().nullable(),
  phone: z
    .string()
    .max(30)
    .regex(/^[+\d\s\-().]*$/, "Invalid phone number format")
    .transform((v) => v.trim())
    .optional()
    .nullable(),
  image: url,
  password: password.optional(),
})

// ─── Summit Records ────────────────────────────────────────────────────────────

export const createSummitRecordSchema = z.object({
  expeditionId: id,
  status: z.enum(VALID_SUMMIT_STATUS).default("SUCCESSFUL"),
  summitDate: z.string().datetime({ offset: true }).optional().nullable(),
  notes: optionalText(2000),
})

export const updateSummitRecordSchema = z.object({
  expeditionId: z.string().cuid().optional(),
  status: z.enum(VALID_SUMMIT_STATUS).optional(),
  summitDate: z.string().datetime({ offset: true }).optional().nullable(),
  notes: optionalText(2000),
})

export const adminSummitRecordSchema = z.object({
  userId: id,
  expeditionId: id,
  status: z.enum(VALID_SUMMIT_STATUS),
  summitDate: z.string().datetime({ offset: true }).optional().nullable(),
  altitude: z.number().int().min(0).max(9000).optional(),
})

// ─── Expeditions ───────────────────────────────────────────────────────────────

const itinerarySchema = z.object({
  dayNumber: z.number().int().min(1).max(365),
  title: shortText(200),
  description: z.string().max(5000).transform((v) => v.trim()),
  altitude: z.number().int().min(0).max(9000).optional().nullable(),
  activities: z.array(z.string().max(200)).max(20).optional(),
})

const gearItemSchema = z.object({
  productId: z.string().cuid().optional().nullable(),
  name: z.string().max(200).optional(),
  quantity: z.number().int().min(1).max(1000).optional(),
  required: z.boolean().optional(),
})

export const createExpeditionSchema = z.object({
  title: shortText(200),
  slug,
  description: z.string().max(20000).transform((v) => v.trim()),
  shortDescription: optionalText(500),
  category: z.enum(VALID_CATEGORIES),
  difficulty: z.enum(VALID_DIFFICULTIES),
  altitude: z.number().int().min(0).max(9000),
  duration: z.number().int().min(1).max(365),
  basePrice: z.number().min(0),
  location: shortText(300),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  heroImage: url,
  videoUrl: url,
  gallery: z.array(z.string().url().max(2048)).max(50).optional(),
  maxGroupSize: z.number().int().min(1).max(500).optional().nullable(),
  minGroupSize: z.number().int().min(1).max(500).optional().nullable(),
  successRate: z.number().min(0).max(100).optional().nullable(),
  metaTitle: optionalText(200),
  metaDescription: optionalText(400),
  isActive: z.boolean().optional(),
  featured: z.boolean().optional(),
  mountainRange: z.enum(VALID_MOUNTAIN_RANGES).optional().nullable(),
  requiredEquipment: z.string().max(10000).transform((v) => v.trim()).optional().nullable(),
  paymentPolicy: z.string().max(10000).transform((v) => v.trim()).optional().nullable(),
  refundPolicy: z.string().max(10000).transform((v) => v.trim()).optional().nullable(),
  itineraries: z.array(itinerarySchema).max(365).optional(),
  requiredGear: z.array(gearItemSchema).max(100).optional()
    .transform((items) => items?.filter((item) => item.name || item.productId) ?? []),
})

export const updateExpeditionSchema = createExpeditionSchema.partial()

// ─── Users (admin) ─────────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  email,
  password,
  name: z.string().max(100).transform((v) => v.trim()).optional().nullable(),
  role: z.enum(VALID_ROLES).default("CLIMBER"),
})

export const updateUserSchema = z.object({
  email: email.optional(),
  name: z.string().max(100).transform((v) => v.trim()).optional().nullable(),
  role: z.enum(VALID_ROLES).optional(),
  bio: z.string().max(2000).transform((v) => v.trim()).optional().nullable(),
  phone: z
    .string()
    .max(30)
    .regex(/^[+\d\s\-().]*$/, "Invalid phone number format")
    .transform((v) => v.trim())
    .optional()
    .nullable(),
  image: url,
  featured: z.boolean().optional(),
  password: password.optional(),
})

// ─── Testimonials ──────────────────────────────────────────────────────────────

export const createTestimonialSchema = z.object({
  name: shortText(100),
  role: optionalText(100),
  content: z.string().min(1).max(2000).transform((v) => v.trim()),
  imageUrl: url,
  order: z.number().int().min(0).optional(),
})

// ─── About Us settings ─────────────────────────────────────────────────────────

export const aboutUsSchema = z.object({
  text: z.string().max(10000).transform((v) => v.trim()).optional(),
  mission: z.string().max(5000).transform((v) => v.trim()).optional(),
  founder1Image: url,
  founder2Image: url,
  founder3Image: url,
  founder1Name: optionalText(100),
  founder2Name: optionalText(100),
  founder3Name: optionalText(100),
})

// ─── Weather query ─────────────────────────────────────────────────────────────

export const weatherQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
})

// ─── Coupons ───────────────────────────────────────────────────────────────────

const VALID_DISCOUNT_TYPES = ["PERCENTAGE", "FIXED"] as const

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[A-Z0-9_-]+$/, "Code must be uppercase letters, numbers, hyphens or underscores")
    .transform((v) => v.trim().toUpperCase()),
  description: optionalText(500),
  discountType: z.enum(VALID_DISCOUNT_TYPES),
  discountValue: z.number().positive().max(100, "Percentage discount cannot exceed 100"),
  maxUses: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().datetime({ offset: true }).optional().nullable(),
  isActive: z.boolean().optional(),
  allowedUserIds: z.array(z.string().cuid()).max(500).optional(),
})

export const updateCouponSchema = createCouponSchema.partial()
