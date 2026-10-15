import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI && process.env.NODE_ENV !== "test") {
  console.warn(
    "MONGODB_URI is not configured; database-backed features are unavailable."
  )
}

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongooseCache: MongooseCache | undefined
}

const cache = globalThis.mongooseCache ?? { conn: null, promise: null }
globalThis.mongooseCache = cache

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("Database configuration is missing. Set MONGODB_URI.")
  }

  if (cache.conn) {
    return cache.conn
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    })
  }

  try {
    cache.conn = await cache.promise
    return cache.conn
  } catch (error) {
    cache.promise = null
    throw error
  }
}
