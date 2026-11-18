"use server"

import {
  listPublicSounds,
  getPublicCategories,
  getHomeInitialData,
  type PublicCategoryItem,
  type PublicSoundsResult,
  type HomeInitialData,
} from "@/lib/services/sounds"

export type FetchSoundsParams = {
  q?: string
  category?: string
  sort?: "trending" | "popular" | "newest" | "favorites"
  page?: number
  limit?: number
  featured?: boolean
}

export async function fetchSoundsAction(
  params: FetchSoundsParams = {}
): Promise<PublicSoundsResult> {
  const result = await listPublicSounds(params)
  return JSON.parse(JSON.stringify(result))
}

export async function fetchCategoriesAction(): Promise<PublicCategoryItem[]> {
  const categories = await getPublicCategories()
  return JSON.parse(JSON.stringify(categories))
}

export async function getHomeInitialDataAction(): Promise<HomeInitialData> {
  const data = await getHomeInitialData()
  return JSON.parse(JSON.stringify(data))
}
