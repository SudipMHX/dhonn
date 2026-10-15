import { getApiAdmin } from "@/lib/authz"
import { connectToDatabase } from "@/lib/db/mongoose"
import {
  InvalidJsonError,
  jsonError,
  readJson,
  RequestBodyTooLargeError,
} from "@/lib/http"
import { Category, Sound } from "@/models"
import { z } from "zod"
import { logError } from "@/lib/logger"
import { objectIdSchema } from "@/lib/validation/schemas"
import {
  combineFilters,
  cursorFilter,
  pageResults,
  textSearch,
  parseListQuery,
} from "@/lib/cursor-listing"

export const runtime = "nodejs"

const categorySchema = z.object({
  name: z.string().trim().min(2).max(40),
  description: z.string().trim().max(240).optional().default(""),
})

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export async function GET(request: Request) {
  if (!(await getApiAdmin()))
    return jsonError("Administrator access required.", 403)
  try {
    const parsed = parseListQuery(new URL(request.url))
    if (!parsed.success) return jsonError("Invalid list query.", 400)
    await connectToDatabase()
    const query = combineFilters(
      cursorFilter(parsed.data.after),
      textSearch(parsed.data.q)
    )
    const categories = await Category.find(query)
      .select("name slug description createdAt")
      .sort({ createdAt: -1, _id: -1 })
      .limit(parsed.data.limit + 1)
      .lean()
    return Response.json(pageResults(categories, parsed.data.limit))
  } catch (error) {
    logError("admin_category_listing_failed", error)
    return jsonError("Unable to load categories.", 503)
  }
}

export async function POST(request: Request) {
  if (!(await getApiAdmin()))
    return jsonError("Administrator access required.", 403)
  try {
    const body = await readJson(request)
    const parsed = categorySchema.safeParse(body)
    if (!parsed.success) return jsonError("Invalid category details.", 400)
    await connectToDatabase()
    const slug = slugify(parsed.data.name)
    const category = await Category.create({ ...parsed.data, slug })
    return Response.json(
      { id: category._id.toString(), name: category.name, slug: category.slug },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof InvalidJsonError)
      return jsonError("A JSON request body is required.", 400)
    if (error instanceof RequestBodyTooLargeError)
      return jsonError("Request body is too large.", 413)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return jsonError("That category already exists.", 409)
    }
    logError("category_creation_failed", error)
    return jsonError("Unable to create category.", 503)
  }
}

export async function DELETE(request: Request) {
  if (!(await getApiAdmin()))
    return jsonError("Administrator access required.", 403)
  const categoryId = new URL(request.url).searchParams.get("id")
  if (!objectIdSchema.safeParse(categoryId).success)
    return jsonError("Invalid category.", 400)
  try {
    await connectToDatabase()
    if (await Sound.exists({ category: categoryId })) {
      return jsonError(
        "Move or remove this category's sounds before deleting it.",
        409
      )
    }
    const result = await Category.deleteOne({ _id: categoryId })
    return result.deletedCount
      ? Response.json({ deleted: true })
      : jsonError("Category not found.", 404)
  } catch (error) {
    logError("category_deletion_failed", error)
    return jsonError("Unable to delete category.", 503)
  }
}
