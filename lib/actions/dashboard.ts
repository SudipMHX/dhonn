"use server"

import { compare, hash } from "bcryptjs"
import { z } from "zod"

import { requireAdmin, requireUser } from "@/lib/authz"
import { connectToDatabase } from "@/lib/db/mongoose"
import {
  cursorFilter,
  pageResults,
  textSearch,
  combineFilters,
  parseListQuery,
} from "@/lib/cursor-listing"
import {
  isObjectLockedByBucketPolicy,
  permanentlyDeleteSound,
} from "@/lib/services/remove-sound"
import { Category, Report, Sound, User } from "@/models"
import {
  adminSoundUpdateSchema,
  objectIdSchema,
  soundInputSchema,
  uploadRequestSchema,
} from "@/lib/validation/schemas"
import { logError } from "@/lib/logger"
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit"
import {
  createSoundUpload,
  UploadServiceError,
  verifySoundUpload,
} from "@/lib/services/uploads"

const adminSectionSchema = z.enum([
  "sounds",
  "uploads",
  "reports",
  "categories",
  "users",
])
const adminStatusSchema = z.enum([
  "all",
  "pending",
  "published",
  "rejected",
  "removed",
  "open",
  "reviewing",
  "resolved",
  "dismissed",
  "active",
  "suspended",
])
const creatorStatusSchema = z.enum([
  "all",
  "uploading",
  "pending",
  "published",
  "rejected",
  "removed",
])

export type DashboardListInput = {
  section: string
  q: string
  status: string
  limit: number
  after: string | null
}

export async function startCreatorUpload(
  input: Record<string, unknown>
): Promise<
  | {
      ok: true
      ticket: {
        soundId: string
        uploadUrl: string
        contentType: "audio/mpeg" | "audio/wav"
      }
    }
  | { ok: false; error: string }
> {
  const user = await requireUser()
  try {
    const parsed = uploadRequestSchema.safeParse(input)
    if (!parsed.success)
      return { ok: false, error: "Invalid upload details or file size." }
    return {
      ok: true,
      ticket: await createSoundUpload(user.id, parsed.data),
    }
  } catch (error) {
    if (error instanceof RateLimitError || error instanceof UploadServiceError)
      return { ok: false, error: error.message }
    logError("creator_upload_start_action_failed", error)
    return {
      ok: false,
      error: "Unable to start this upload right now.",
    }
  }
}

export async function completeCreatorUpload(
  soundId: string
): Promise<ActionResult> {
  const user = await requireUser()
  try {
    if (!objectIdSchema.safeParse(soundId).success)
      return { ok: false, error: "Upload not found." }
    await verifySoundUpload(soundId, user.id)
    return { ok: true }
  } catch (error) {
    if (error instanceof RateLimitError || error instanceof UploadServiceError)
      return { ok: false, error: error.message }
    logError("creator_upload_complete_action_failed", error)
    return {
      ok: false,
      error: "Unable to verify this upload right now.",
    }
  }
}

export type DashboardPage<T> = {
  items: T[]
  hasMore: boolean
  nextCursor: string | null
}

export type AdminDashboardAction =
  | "user.update"
  | "sound.update"
  | "sound.delete"
  | "report.update"
  | "category.create"
  | "category.delete"

export type ActionResult = { ok: true } | { ok: false; error: string }
export type ProfileActionResult =
  { ok: true; name: string } | { ok: false; error: string }

const categoryInputSchema = z.object({
  name: z.string().trim().min(2).max(40),
  description: z.string().trim().max(240).optional().default(""),
})
const reportUpdateSchema = z.object({
  id: objectIdSchema,
  status: z.enum(["reviewing", "resolved", "dismissed"]),
})
const userUpdateSchema = z.object({
  id: objectIdSchema,
  status: z.enum(["active", "suspended"]),
})
const profileInputSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    currentPassword: z.string().min(1).max(128).optional(),
    newPassword: z.string().min(10).max(128).optional(),
  })
  .refine(
    (value) => Boolean(value.currentPassword) === Boolean(value.newPassword),
    {
      message: "Both password fields are required to change your password.",
    }
  )

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function serialized<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function parseListInput(input: DashboardListInput) {
  const params = new URLSearchParams({
    q: input.q,
    limit: String(input.limit),
  })
  if (input.after) params.set("after", input.after)
  return parseListQuery(new URL(`http://localhost/?${params}`))
}

export async function getAdminDashboardPage(
  input: DashboardListInput
): Promise<DashboardPage<Record<string, unknown>>> {
  await requireAdmin()
  const section = adminSectionSchema.safeParse(input.section)
  const parsed = parseListInput(input)
  const status = adminStatusSchema.safeParse(input.status)
  if (!section.success || !parsed.success || !status.success)
    throw new Error("Invalid admin list query.")
  const validStatuses: Record<string, string[]> = {
    sounds: ["all", "pending", "published", "rejected", "removed"],
    uploads: ["all"],
    reports: ["all", "open", "reviewing", "resolved", "dismissed"],
    categories: ["all"],
    users: ["all", "active", "suspended"],
  }
  if (!validStatuses[section.data].includes(status.data))
    throw new Error("Invalid admin list status.")
  await connectToDatabase()
  const statusFilter =
    section.data === "uploads"
      ? { status: "pending" }
      : status.data !== "all" &&
          ["sounds", "reports", "users"].includes(section.data)
        ? { status: status.data }
        : {}
  const filter = combineFilters(
    statusFilter,
    cursorFilter(parsed.data.after),
    textSearch(parsed.data.q)
  )
  let documents
  switch (section.data) {
    case "sounds":
    case "uploads":
      documents = await Sound.find(filter)
        .select(
          "title description slug status moderationNote categoryName tags owner audio.durationSeconds plays favorites featured trending createdAt"
        )
        .populate("owner", "name email")
        .sort({ createdAt: -1, _id: -1 })
        .limit(parsed.data.limit + 1)
        .lean()
      break
    case "reports":
      documents = await Report.find(filter)
        .populate("sound", "title slug status")
        .sort({ createdAt: -1, _id: -1 })
        .limit(parsed.data.limit + 1)
        .lean()
      break
    case "categories":
      documents = await Category.find(filter)
        .select("name slug description createdAt")
        .sort({ createdAt: -1, _id: -1 })
        .limit(parsed.data.limit + 1)
        .lean()
      break
    case "users":
      documents = await User.find(filter)
        .select("name email role status createdAt")
        .sort({ createdAt: -1, _id: -1 })
        .limit(parsed.data.limit + 1)
        .lean()
      break
  }
  return serialized(pageResults(documents, parsed.data.limit))
}

export async function getCreatorDashboardPage(
  input: Omit<DashboardListInput, "section">
): Promise<DashboardPage<Record<string, unknown>>> {
  const user = await requireUser()
  const parsed = parseListInput({ ...input, section: "uploads" })
  const status = creatorStatusSchema.safeParse(input.status)
  if (!parsed.success || !status.success)
    throw new Error("Invalid upload list query.")
  await connectToDatabase()
  const filter = combineFilters(
    { owner: user.id },
    status.data === "all" ? {} : { status: status.data },
    textSearch(parsed.data.q),
    cursorFilter(parsed.data.after)
  )
  const documents = await Sound.find(filter)
    .select(
      "title description category categoryName tags status moderationNote createdAt publishedAt"
    )
    .populate("category", "slug")
    .sort({ createdAt: -1, _id: -1 })
    .limit(parsed.data.limit + 1)
    .lean()
  return serialized(pageResults(documents, parsed.data.limit))
}

export async function getCreatorCategories() {
  await requireUser()
  await connectToDatabase()
  return serialized(
    await Category.find()
      .select("name slug")
      .sort({ name: 1 })
      .limit(100)
      .lean()
  )
}

export async function mutateAdminDashboard(
  action: AdminDashboardAction,
  id: string,
  payload: Record<string, unknown> = {}
): Promise<ActionResult> {
  const admin = await requireAdmin()
  try {
    await connectToDatabase()
    switch (action) {
      case "user.update": {
        const parsed = userUpdateSchema.safeParse({ ...payload, id })
        if (!parsed.success) return { ok: false, error: "Invalid user update." }
        if (parsed.data.id === admin.id)
          return {
            ok: false,
            error: "You cannot suspend your own account.",
          }
        const user = await User.findByIdAndUpdate(
          parsed.data.id,
          { $set: { status: parsed.data.status } },
          { new: true }
        )
        if (!user) return { ok: false, error: "User not found." }
        break
      }
      case "sound.update": {
        const parsed = adminSoundUpdateSchema.safeParse({ ...payload, id })
        if (!parsed.success)
          return { ok: false, error: "Invalid sound update." }
        const {
          title,
          description,
          category: categoryId,
          tags,
          status,
          featured,
          trending,
          moderationNote,
        } = parsed.data
        const updates: Record<string, unknown> = {}
        if (title !== undefined) updates.title = title
        if (description !== undefined) updates.description = description
        if (tags !== undefined)
          updates.tags = [...new Set(tags.map((tag) => tag.toLowerCase()))]
        if (categoryId !== undefined) {
          const category = await Category.findById(categoryId)
            .select("name")
            .lean()
          if (!category) return { ok: false, error: "Category not found." }
          updates.category = categoryId
          updates.categoryName = category.name
        }
        if (status) {
          if (status === "published") {
            const verified = await Sound.findById(id)
              .select("audio.sha256 audio.durationSeconds")
              .lean()
            if (!verified?.audio.sha256 || verified.audio.durationSeconds <= 0)
              return {
                ok: false,
                error: "Audio verification must finish before publishing.",
              }
          }
          updates.status = status
          if (status === "published") updates.publishedAt = new Date()
        }
        if (featured !== undefined) updates.featured = featured
        if (trending !== undefined) updates.trending = trending
        if (moderationNote !== undefined)
          updates.moderationNote = moderationNote
        const sound = await Sound.findByIdAndUpdate(
          id,
          { $set: updates },
          { new: true }
        )
        if (!sound) return { ok: false, error: "Sound not found." }
        break
      }
      case "sound.delete": {
        if (!objectIdSchema.safeParse(id).success)
          return { ok: false, error: "Sound not found." }
        const sound = await Sound.findById(id).select("audio.storageKey").lean()
        if (!sound) return { ok: false, error: "Sound not found." }
        if (
          !(await permanentlyDeleteSound(
            sound._id.toString(),
            sound.audio.storageKey
          ))
        )
          return { ok: false, error: "Sound not found." }
        break
      }
      case "report.update": {
        const parsed = reportUpdateSchema.safeParse({ ...payload, id })
        if (!parsed.success)
          return { ok: false, error: "Invalid report update." }
        const report = await Report.findByIdAndUpdate(
          parsed.data.id,
          { $set: { status: parsed.data.status } },
          { new: true }
        )
        if (!report) return { ok: false, error: "Report not found." }
        break
      }
      case "category.create": {
        const parsed = categoryInputSchema.safeParse(payload)
        if (!parsed.success)
          return { ok: false, error: "Invalid category details." }
        try {
          await Category.create({
            ...parsed.data,
            slug: slugify(parsed.data.name),
          })
        } catch (error) {
          if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === 11000
          )
            return { ok: false, error: "That category already exists." }
          throw error
        }
        break
      }
      case "category.delete": {
        if (!objectIdSchema.safeParse(id).success)
          return { ok: false, error: "Invalid category." }
        if (await Sound.exists({ category: id }))
          return {
            ok: false,
            error: "Move or remove this category's sounds before deleting it.",
          }
        const deleted = await Category.deleteOne({ _id: id })
        if (!deleted.deletedCount)
          return { ok: false, error: "Category not found." }
        break
      }
      default:
        return { ok: false, error: "Unsupported admin action." }
    }
    return { ok: true }
  } catch (error) {
    logError("admin_dashboard_action_failed", error)
    if (isObjectLockedByBucketPolicy(error)) {
      return {
        ok: false,
        error:
          "Cloudflare R2 is retaining this audio file under a bucket lock rule. Review the bucket lock rules before retrying.",
      }
    }
    return {
      ok: false,
      error: "Unable to complete this admin action right now.",
    }
  }
}

export async function mutateCreatorUpload(
  action: "update" | "delete",
  soundId: string,
  payload: Record<string, unknown> = {}
): Promise<ActionResult> {
  const user = await requireUser()
  try {
    if (action !== "update" && action !== "delete")
      return { ok: false, error: "Unsupported upload action." }
    if (!objectIdSchema.safeParse(soundId).success)
      return { ok: false, error: "Upload not found." }
    await enforceRateLimit(
      action === "delete" ? "upload-remove" : "creator-upload-update",
      user.id,
      action === "delete" ? 20 : 30,
      3600
    )
    await connectToDatabase()
    if (action === "delete") {
      const sound = await Sound.findOne({ _id: soundId, owner: user.id })
        .select("audio.storageKey")
        .lean()
      if (!sound) return { ok: false, error: "Upload not found." }
      if (
        !(await permanentlyDeleteSound(
          sound._id.toString(),
          sound.audio.storageKey
        ))
      )
        return { ok: false, error: "Upload not found." }
      return { ok: true }
    }
    const parsed = soundInputSchema.safeParse(payload)
    if (!parsed.success) return { ok: false, error: "Invalid upload details." }
    const sound = await Sound.findOne({ _id: soundId, owner: user.id })
    if (!sound) return { ok: false, error: "Upload not found." }
    if (sound.status === "uploading" || sound.status === "removed")
      return { ok: false, error: "This upload cannot be edited yet." }
    const category = await Category.findOne({ slug: parsed.data.category })
      .select("_id name")
      .lean()
    if (!category) return { ok: false, error: "Choose a valid category." }
    sound.title = parsed.data.title
    sound.description = parsed.data.description
    sound.category = category._id
    sound.categoryName = category.name
    sound.tags = parsed.data.tags
    sound.status = "pending"
    sound.moderationNote = ""
    sound.publishedAt = null
    await sound.save()
    return { ok: true }
  } catch (error) {
    if (error instanceof RateLimitError)
      return { ok: false, error: error.message }
    logError("creator_dashboard_action_failed", error)
    if (isObjectLockedByBucketPolicy(error)) {
      return {
        ok: false,
        error:
          "Cloudflare R2 is retaining this audio file under a bucket lock rule. Review the bucket lock rules before retrying.",
      }
    }
    return {
      ok: false,
      error: "Unable to complete this upload action right now.",
    }
  }
}

export async function updateCreatorProfile(
  input: Record<string, unknown>
): Promise<ProfileActionResult> {
  const user = await requireUser()
  try {
    const parsed = profileInputSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: "Invalid profile update." }
    await enforceRateLimit("profile-update", user.id, 20, 3600)
    await connectToDatabase()
    const account = await User.findOne({
      _id: user.id,
      status: "active",
    }).select("+passwordHash")
    if (!account) return { ok: false, error: "Account not found." }
    if (parsed.data.newPassword) {
      if (!(await compare(parsed.data.currentPassword!, account.passwordHash)))
        return { ok: false, error: "Current password is incorrect." }
      account.passwordHash = await hash(parsed.data.newPassword, 12)
    }
    account.name = parsed.data.name
    await account.save()
    return { ok: true, name: account.name }
  } catch (error) {
    if (error instanceof RateLimitError)
      return { ok: false, error: error.message }
    logError("creator_profile_action_failed", error)
    return {
      ok: false,
      error: "Unable to update your profile right now.",
    }
  }
}
