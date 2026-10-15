import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(10).max(128),
})

export const soundQuerySchema = z.object({
  q: z.string().trim().max(100).optional().default(""),
  category: z.string().trim().max(40).optional(),
  featured: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  sort: z
    .enum(["newest", "popular", "favorites", "trending"])
    .optional()
    .default("trending"),
  page: z.coerce.number().int().min(1).max(1000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(48).optional().default(24),
})

export const soundInputSchema = z.object({
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().max(1000).default(""),
  category: z.string().trim().min(1).max(40),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
})

export const reportSchema = z.object({
  soundId: z.string().regex(/^[a-f\d]{24}$/i),
  type: z.enum(["copyright", "inappropriate", "other"]),
  details: z.string().trim().min(20).max(2000),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
})

export const uploadRequestSchema = soundInputSchema.extend({
  rightsConfirmed: z.literal(true),
  fileName: z.string().trim().min(1).max(120),
  contentType: z.enum(["audio/mpeg", "audio/wav"]),
  size: z
    .number()
    .int()
    .positive()
    .max(15 * 1024 * 1024),
})

export const adminSoundUpdateSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
  title: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(1000).optional(),
  category: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).optional(),
  status: z.enum(["pending", "published", "rejected"]).optional(),
  featured: z.boolean().optional(),
  trending: z.boolean().optional(),
  moderationNote: z.string().trim().max(500).optional(),
})

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i)
