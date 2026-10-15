import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CategoryPageClient } from "@/components/category-page-client"
import {
  countPublishedInCategory,
  getCategoryBySlug,
} from "@/lib/services/sounds"

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category)
    return {
      title: "Category not found",
      robots: { index: false, follow: false },
    }
  const count = await countPublishedInCategory(category._id)
  return {
    title: `${category.name} sounds`,
    description:
      category.description || `Explore ${category.name} sounds on dhonn.`,
    alternates: { canonical: `/category/${encodeURIComponent(category.slug)}` },
    ...(count === 0 ? { robots: { index: false, follow: true } } : {}),
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()
  return (
    <CategoryPageClient
      categoryId={category._id.toString()}
      name={`${category.name} sounds`}
      description={
        category.description ||
        `Browse creator-made ${category.name.toLowerCase()} sounds.`
      }
    />
  )
}
