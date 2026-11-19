import { Types } from "mongoose"
import { cache } from "react"

import { Category, Favorite, PlayEvent, Sound } from "@/models"
import { connectToDatabase } from "@/lib/db/mongoose"

export type SoundQueryParams = {
  q?: string
  category?: string
  featured?: boolean
  sort?: "trending" | "popular" | "newest" | "favorites"
  page?: number
  limit?: number
}

export type SoundQuery = SoundQueryParams

export type PublicSoundItem = {
  _id: string
  slug: string
  title: string
  description: string
  categoryName: string
  tags: string[]
  audio: { durationSeconds: number }
  plays: number
  favorites: number
  featured?: boolean
  trending?: boolean
  publishedAt?: string
}

export type PublicSoundsResult = {
  sounds: PublicSoundItem[]
  hasMore: boolean
  page: number
}

export type PublicCategoryItem = {
  _id: string
  name: string
  slug: string
  description?: string
}

export type HomeInitialData = {
  categories: PublicCategoryItem[]
  sounds: PublicSoundItem[]
  featured: PublicSoundItem[]
  recent: PublicSoundItem[]
  hasMore: boolean
}

const soundCardFields =
  "slug title description categoryName tags audio.durationSeconds plays favorites featured trending publishedAt"

export async function listPublicSounds(
  query: SoundQueryParams = {}
): Promise<PublicSoundsResult> {
  await connectToDatabase()
  const page = Math.max(1, query.page ?? 1)
  const limit = Math.max(1, Math.min(100, query.limit ?? 24))

  const filter: Record<string, unknown> = { status: "published" }
  if (query.featured !== undefined) filter.featured = query.featured
  if (query.category && typeof query.category === "string") {
    const cleanCat = query.category.trim()
    if (Types.ObjectId.isValid(cleanCat)) {
      filter.category = new Types.ObjectId(cleanCat)
    } else {
      const category = await Category.findOne({
        slug: cleanCat.toLowerCase(),
      })
        .select("_id")
        .lean()
      if (!category) return { sounds: [], hasMore: false, page }
      filter.category = category._id
    }
  }

  const trimmedQ = typeof query.q === "string" ? query.q.trim() : ""
  if (trimmedQ) filter.$text = { $search: trimmedQ }

  const sort: Record<string, 1 | -1 | { $meta: "textScore" }> = trimmedQ
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
    .skip((page - 1) * limit)
    .limit(limit + 1)
    .lean()

  const hasMore = results.length > limit
  const rawSounds = hasMore ? results.slice(0, limit) : results
  const sounds = JSON.parse(JSON.stringify(rawSounds)) as PublicSoundItem[]

  return {
    sounds,
    hasMore,
    page,
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

export async function getPublicCategories(): Promise<PublicCategoryItem[]> {
  await connectToDatabase()
  const categories = await Category.find()
    .select("name slug description")
    .sort({ name: 1 })
    .limit(100)
    .lean()
  return JSON.parse(JSON.stringify(categories)) as PublicCategoryItem[]
}

export async function countPublishedInCategory(
  categoryId: Types.ObjectId | string
) {
  await connectToDatabase()
  const id =
    typeof categoryId === "string" && Types.ObjectId.isValid(categoryId)
      ? new Types.ObjectId(categoryId)
      : categoryId
  return Sound.countDocuments({ category: id, status: "published" })
}

export async function getRelatedSounds(
  soundId: Types.ObjectId | string,
  categoryId: Types.ObjectId | string,
  limit = 4
): Promise<PublicSoundItem[]> {
  await connectToDatabase()
  const sid =
    typeof soundId === "string" && Types.ObjectId.isValid(soundId)
      ? new Types.ObjectId(soundId)
      : soundId
  const cid =
    typeof categoryId === "string" && Types.ObjectId.isValid(categoryId)
      ? new Types.ObjectId(categoryId)
      : categoryId
  const results = await Sound.find({
    status: "published",
    category: cid,
    _id: { $ne: sid },
  })
    .select(soundCardFields)
    .sort({ plays: -1 })
    .limit(limit)
    .lean()
  return JSON.parse(JSON.stringify(results)) as PublicSoundItem[]
}

export async function getHomeInitialData(): Promise<HomeInitialData> {
  await connectToDatabase()
  const [categories, sounds, featured, recent] = await Promise.all([
    getPublicCategories(),
    listPublicSounds({ page: 1, limit: 18, sort: "trending" }),
    listPublicSounds({ page: 1, limit: 6, sort: "popular", featured: true }),
    listPublicSounds({ page: 1, limit: 6, sort: "newest" }),
  ])

  return JSON.parse(
    JSON.stringify({
      categories,
      sounds: sounds.sounds,
      featured: featured.sounds,
      recent: recent.sounds,
      hasMore: sounds.hasMore,
    })
  ) as HomeInitialData
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
  const [favorites, uploads, recent, allUserSounds] = await Promise.all([
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
      .select(
        "title slug status moderationNote createdAt categoryName audio.durationSeconds"
      )
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    PlayEvent.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate({
        path: "sound",
        select: soundCardFields,
        match: { status: "published" },
      })
      .lean(),
    Sound.find({ owner: userId }).select("plays favorites").lean(),
  ])

  const totalPlays = allUserSounds.reduce((sum, s) => sum + (s.plays || 0), 0)
  const totalSoundFavorites = allUserSounds.reduce(
    (sum, s) => sum + (s.favorites || 0),
    0
  )

  return {
    favorites,
    uploads,
    recent,
    totalPlays,
    totalSoundFavorites,
    totalUploads: allUserSounds.length,
  }
}
