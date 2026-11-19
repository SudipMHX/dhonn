import { Types } from "mongoose"
import { z } from "zod"

const listQuerySchema = z.object({
  after: z
    .string()
    .regex(/^[0-9a-z]{1,10}\.[a-f\d]{24}$/i)
    .optional(),
  q: z.string().trim().max(100).default(""),
  limit: z.coerce.number().int().min(1).max(50).default(25),
})

export type ListQuery = z.infer<typeof listQuerySchema>

export function parseListQuery(url: URL) {
  return listQuerySchema.safeParse({
    after: url.searchParams.get("after") || undefined,
    q: url.searchParams.get("q") ?? "",
    limit: url.searchParams.get("limit") ?? undefined,
  })
}

export function cursorFilter(after?: string) {
  if (!after || typeof after !== "string") return {}
  const parts = after.split(".")
  if (
    parts.length !== 2 ||
    !/^[0-9a-z]{1,10}$/i.test(parts[0]) ||
    !/^[a-f\d]{24}$/i.test(parts[1])
  ) {
    return {}
  }
  const [timestamp, id] = parts
  const timeMs = parseInt(timestamp, 36)
  if (Number.isNaN(timeMs)) return {}
  const createdAt = new Date(timeMs)
  const objectId = new Types.ObjectId(id)
  return {
    $or: [
      { createdAt: { $lt: createdAt } },
      { createdAt, _id: { $lt: objectId } },
    ],
  }
}

export function textSearch(q: string) {
  if (typeof q !== "string") return {}
  const trimmed = q.trim()
  return trimmed ? { $text: { $search: trimmed } } : {}
}

export function combineFilters(...filters: Array<Record<string, unknown>>) {
  const clauses = filters.filter(
    (filter) =>
      filter && typeof filter === "object" && Object.keys(filter).length > 0
  )
  return clauses.length ? { $and: clauses } : {}
}

export function pageResults<
  T extends { _id: { toString(): string }; createdAt: Date | string },
>(documents: T[], limit: number) {
  const hasMore = documents.length > limit
  const items = hasMore ? documents.slice(0, limit) : documents
  const lastItem = items[items.length - 1]
  const timestamp = lastItem
    ? new Date(lastItem.createdAt).getTime().toString(36)
    : ""

  return {
    items,
    hasMore,
    nextCursor: hasMore ? `${timestamp}.${lastItem._id.toString()}` : null,
  }
}
