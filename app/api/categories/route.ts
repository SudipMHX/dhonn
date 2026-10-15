import { connectToDatabase } from "@/lib/db/mongoose"
import { Category } from "@/models"
import { logError } from "@/lib/logger"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await connectToDatabase()
    const categories = await Category.find()
      .select("name slug description")
      .sort({ name: 1 })
      .limit(100)
      .lean()
    return Response.json(categories, {
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    logError("category_lookup_failed", error)
    return Response.json(
      { error: "Categories are temporarily unavailable." },
      { status: 503 }
    )
  }
}
