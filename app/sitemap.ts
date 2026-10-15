import type { MetadataRoute } from "next"

import { connectToDatabase } from "@/lib/db/mongoose"
import { Category, Sound } from "@/models"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectToDatabase()
  const baseUrl = process.env.APP_URL ?? "http://localhost:3000"
  const [sounds, activeCategories] = await Promise.all([
    Sound.find({ status: "published" })
      .select("slug updatedAt")
      .sort({ publishedAt: -1 })
      .limit(10000)
      .lean(),
    Sound.distinct("category", { status: "published" }),
  ])
  const categories = await Category.find({ _id: { $in: activeCategories } })
    .select("slug updatedAt")
    .sort({ slug: 1 })
    .limit(200)
    .lean()
  return [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    ...categories.map((category) => ({
      url: `${baseUrl}/category/${encodeURIComponent(category.slug)}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...sounds.map((sound) => ({
      url: `${baseUrl}/sound/${encodeURIComponent(sound.slug)}`,
      lastModified: sound.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]
}
