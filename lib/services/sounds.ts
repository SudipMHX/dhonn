import { Types } from "mongoose"
import { cache } from "react"

import { Category, Favorite, PlayEvent, Sound } from "@/models"
import { connectToDatabase } from "@/lib/db/mongoose"
import type { z } from "zod"
import type { soundQuerySchema } from "@/lib/validation/schemas"

type SoundQuery = z.infer<typeof soundQuerySchema>

const soundCardFields =
  "slug title description categoryName tags audio.durationSeconds plays favorites featured trending publishedAt"

export async function listPublicSounds(query: SoundQuery) {
  await connectToDatabase()
  const filter: Record<string, unknown> = { status: "published" }
  if (query.featured !== undefined) filter.featured = query.featured
  if (query.category) {
    if (Types.ObjectId.isValid(query.category)) {
      filter.category = new Types.ObjectId(query.category)
    } else {
      const category = await Category.findOne({
        slug: query.category.toLowerCase(),
      })
        .select("_id")
        .lean()
      if (!category) return { sounds: [], hasMore: false, page: query.page }
      filter.category = category._id
    }
  }

  if (query.q) filter.$text = { $search: query.q }

  const sort: Record<string, 1 | -1 | { $meta: "textScore" }> = query.q
    ? { score: { $meta: "textScore" as const } }
    : query.sort === "newest"
      ? { publishedAt: -1 as const }
      : query.sort === "popular"
        ? { plays: -1 as const }
        : query.sort === "favorites"
          ? { favorites: -1 as const }
          : { trending: -1 as const, plays: -1 as const }
  const results = await Sound.find(filter)
    .select(soundCardFields)
    .sort(sort)
    .skip((query.page - 1) * query.limit)
    .limit(query.limit + 1)
    .lean()

  const hasMore = results.length > query.limit
  return {
    sounds: hasMore ? results.slice(0, query.limit) : results,
    hasMore,
    page: query.page,
  }
}

export async function getPublicSound(slug: string) {
  await connectToDatabase()
  return Sound.findOne({ slug, status: "published" })
    .populate("category", "name slug")
    .populate("owner", "name")
    .lean()
}

export const getCategoryBySlug = cache(async (slug: string) => {
  await connectToDatabase()
  return Category.findOne({ slug }).select("name slug description").lean()
})

export async function getPublicCategories() {
  await connectToDatabase()
  return Category.find()
    .select("name slug description")
    .sort({ name: 1 })
    .limit(100)
    .lean()
}

export async function countPublishedInCategory(categoryId: Types.ObjectId) {
  await connectToDatabase()
  return Sound.countDocuments({ category: categoryId, status: "published" })
}

export async function getRelatedSounds(
  soundId: Types.ObjectId,
  categoryId: Types.ObjectId,
  limit = 4
) {
  await connectToDatabase()
  return Sound.find({
    status: "published",
    category: categoryId,
    _id: { $ne: soundId },
  })
    .select(soundCardFields)
    .sort({ plays: -1 })
    .limit(limit)
    .lean()
}

export async function toggleFavorite(userId: string, soundId: string) {
  await connectToDatabase()
  if (!Types.ObjectId.isValid(soundId)) throw new Error("Sound not found.")
  const sound = await Sound.findOne({ _id: soundId, status: "published" })
    .select("_id")
    .lean()
  if (!sound) throw new Error("Sound not found.")

  const existing = await Favorite.deleteOne({ user: userId, sound: soundId })
  if (existing.deletedCount) {
    await Sound.updateOne(
      { _id: soundId, favorites: { $gt: 0 } },
      { $inc: { favorites: -1 } }
    )
    return { favorited: false }
  }

  try {
    await Favorite.create({ user: userId, sound: soundId })
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return { favorited: true }
    }
    throw error
  }
  await Sound.updateOne({ _id: soundId }, { $inc: { favorites: 1 } })
  return { favorited: true }
}

export async function getUserDashboardData(userId: string) {
  await connectToDatabase()
  const [favorites, uploads, recent] = await Promise.all([
    Favorite.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate({
        path: "sound",
        select: soundCardFields,
        match: { status: "published" },
      })
      .lean(),
    Sound.find({ owner: userId })
      .select("title slug status moderationNote createdAt categoryName")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    PlayEvent.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate({
        path: "sound",
        select: soundCardFields,
        match: { status: "published" },
      })
      .lean(),
  ])
  return { favorites, uploads, recent }
}
