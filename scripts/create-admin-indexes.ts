import { config } from "dotenv"

config({ path: ".env.local" })
config()

const { connectToDatabase } = await import("../lib/db/mongoose.js")
const { Category, Report, Sound, User } = await import("../models/index.js")

async function createAdminIndexes() {
  await connectToDatabase()
  await Promise.all([
    Category.createIndexes(),
    Report.createIndexes(),
    Sound.createIndexes(),
    User.createIndexes(),
  ])
  console.info("Admin and creator search and pagination indexes are ready.")
}

createAdminIndexes()
  .catch((error: unknown) => {
    console.error("Admin index creation failed", error)
    process.exitCode = 1
  })
  .finally(async () => {
    const mongoose = await import("mongoose")
    await mongoose.default.disconnect()
  })
