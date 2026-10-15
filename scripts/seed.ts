import { config } from "dotenv"
import { hash } from "bcryptjs"
import { z } from "zod"

config({ path: ".env.local" })
config()

const { connectToDatabase } = await import("../lib/db/mongoose.js")
const { Category, Favorite, PlayEvent, RateLimit, Report, Sound, User } =
  await import("../models/index.js")

const categories = [
  "Anime & Manga",
  "Games",
  "Memes",
  "Movies",
  "Music",
  "Politics",
  "Pranks",
  "Reactions",
  "Sound Effects",
  "Sports",
  "Television",
  "Tiktok Trends",
  "Viral",
  "Whatsapp Audios",
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

async function seed() {
  await connectToDatabase()
  await Promise.all([
    User.createIndexes(),
    Category.createIndexes(),
    Sound.createIndexes(),
    Favorite.createIndexes(),
    Report.createIndexes(),
    PlayEvent.createIndexes(),
    RateLimit.createIndexes(),
  ])
  for (const name of categories) {
    await Category.updateOne(
      { slug: slugify(name) },
      { $setOnInsert: { name, slug: slugify(name), description: "" } },
      { upsert: true }
    )
  }

  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.INITIAL_ADMIN_PASSWORD
  if ((email && !password) || (!email && password)) {
    throw new Error(
      "Set both INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD to provision the initial admin."
    )
  }
  if (email && password) {
    if (password.length < 16)
      throw new Error("INITIAL_ADMIN_PASSWORD must be at least 16 characters.")
    const validEmail = z.string().email().safeParse(email)
    if (!validEmail.success)
      throw new Error("INITIAL_ADMIN_EMAIL must be a valid email address.")
    const existing = await User.findOne({ email }).select("role").lean()
    if (existing && existing.role !== "admin") {
      throw new Error(
        "That email already belongs to a non-admin account; choose a new email for initial admin provisioning."
      )
    }
    if (!existing) {
      const passwordHash = await hash(password, 12)
      await User.create({
        email,
        name: "Administrator",
        passwordHash,
        role: "admin",
        status: "active",
      })
    }
  }

  console.info(
    "Seeded categories and, when configured, the initial administrator."
  )
}

seed()
  .catch((error: unknown) => {
    console.error("Seed failed", error)
    process.exitCode = 1
  })
  .finally(async () => {
    const mongoose = await import("mongoose")
    await mongoose.default.disconnect()
  })
