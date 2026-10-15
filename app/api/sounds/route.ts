import { jsonError } from "@/lib/http"
import { listPublicSounds } from "@/lib/services/sounds"
import { soundQuerySchema } from "@/lib/validation/schemas"
import { logError } from "@/lib/logger"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const parsed = soundQuerySchema.safeParse({
    q: url.searchParams.get("q") ?? "",
    category: url.searchParams.get("category") ?? undefined,
    featured:
      url.searchParams.get("featured") === null
        ? undefined
        : url.searchParams.get("featured"),
    sort: url.searchParams.get("sort") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  })
  if (!parsed.success) return jsonError("Invalid search parameters.", 400)

  try {
    const result = await listPublicSounds(parsed.data)
    return Response.json(result, {
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=15, stale-while-revalidate=60",
      },
    })
  } catch (error) {
    logError("public_sound_search_failed", error)
    return jsonError("Sound search is temporarily unavailable.", 503)
  }
}
