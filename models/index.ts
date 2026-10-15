import mongoose, { Schema, Types } from "mongoose"

const options = { timestamps: true, versionKey: false } as const

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
      required: true,
    },
    image: { type: String, default: "" },
  },
  options
)
userSchema.index({ name: "text", email: "text" })
userSchema.index({ status: 1, createdAt: -1, _id: -1 })
userSchema.index({ createdAt: -1, _id: -1 })
const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, default: "", maxlength: 240 },
  },
  options
)
categorySchema.index({ name: "text", description: "text" })
categorySchema.index({ createdAt: -1, _id: -1 })
const soundSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: "", maxlength: 1000 },
    category: { type: Types.ObjectId, ref: "Category", required: true },
    categoryName: { type: String, required: true },
    tags: { type: [String], default: [] },
    owner: { type: Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["uploading", "pending", "published", "rejected", "removed"],
      default: "pending",
      required: true,
    },
    moderationNote: { type: String, default: "", maxlength: 500 },
    rightsConfirmedAt: { type: Date, required: true },
    audio: {
      storageKey: { type: String, required: true },
      contentType: {
        type: String,
        enum: ["audio/mpeg", "audio/wav"],
        required: true,
      },
      bytes: { type: Number, required: true, min: 1 },
      durationSeconds: { type: Number, default: 0, min: 0, max: 30 },
      sha256: { type: String, default: undefined },
    },
    plays: { type: Number, default: 0, min: 0 },
    favorites: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
  },
  options
)
soundSchema.index({ status: 1, publishedAt: -1 })
soundSchema.index({ status: 1, createdAt: -1, _id: -1 })
soundSchema.index({ createdAt: -1, _id: -1 })
soundSchema.index({ owner: 1, createdAt: -1, _id: -1 })
soundSchema.index({ owner: 1, status: 1, createdAt: -1, _id: -1 })
soundSchema.index({ status: 1, plays: -1 })
soundSchema.index({ status: 1, favorites: -1 })
soundSchema.index({ status: 1, featured: 1, publishedAt: -1 })
soundSchema.index({ status: 1, trending: 1, plays: -1 })
soundSchema.index({ status: 1, category: 1, publishedAt: -1 })
soundSchema.index({ status: 1, tags: 1, publishedAt: -1 })
soundSchema.index({ "audio.sha256": 1 }, { unique: true, sparse: true })
soundSchema.index({ title: "text", description: "text", tags: "text" })

const favoriteSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    sound: { type: Types.ObjectId, ref: "Sound", required: true },
  },
  options
)
favoriteSchema.index({ user: 1, sound: 1 }, { unique: true })
favoriteSchema.index({ user: 1, createdAt: -1 })

const reportSchema = new Schema(
  {
    sound: { type: Types.ObjectId, ref: "Sound", required: true },
    reporter: { type: Types.ObjectId, ref: "User", default: null },
    email: { type: String, default: "", maxlength: 254 },
    type: {
      type: String,
      enum: ["copyright", "inappropriate", "other"],
      required: true,
    },
    details: { type: String, required: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["open", "reviewing", "resolved", "dismissed"],
      default: "open",
    },
    resolutionNote: { type: String, default: "", maxlength: 500 },
  },
  options
)
reportSchema.index({ status: 1, createdAt: -1 })
reportSchema.index({ status: 1, createdAt: -1, _id: -1 })
reportSchema.index({ createdAt: -1, _id: -1 })
reportSchema.index({ sound: 1, status: 1 })
reportSchema.index({ details: "text", email: "text", type: "text" })

const playEventSchema = new Schema(
  {
    sound: { type: Types.ObjectId, ref: "Sound", required: true },
    user: { type: Types.ObjectId, ref: "User", default: null },
    visitorHash: { type: String, required: true },
    bucket: { type: Number, required: true },
  },
  { ...options, timestamps: { createdAt: true, updatedAt: false } }
)
playEventSchema.index({ sound: 1, createdAt: -1 })
playEventSchema.index({ user: 1, createdAt: -1 })
playEventSchema.index({ sound: 1, visitorHash: 1, bucket: 1 }, { unique: true })
playEventSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 180 }
)

const rateLimitSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, required: true, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: false }
)
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const User = mongoose.models.User ?? mongoose.model("User", userSchema)
export const Category =
  mongoose.models.Category ?? mongoose.model("Category", categorySchema)
export const Sound =
  mongoose.models.Sound ?? mongoose.model("Sound", soundSchema)
export const Favorite =
  mongoose.models.Favorite ?? mongoose.model("Favorite", favoriteSchema)
export const Report =
  mongoose.models.Report ?? mongoose.model("Report", reportSchema)
export const PlayEvent =
  mongoose.models.PlayEvent ?? mongoose.model("PlayEvent", playEventSchema)
export const RateLimit =
  mongoose.models.RateLimit ?? mongoose.model("RateLimit", rateLimitSchema)

export type UserDocument = {
  _id: Types.ObjectId
  name: string
  email: string
  passwordHash: string
  role: "user" | "admin"
  status: "active" | "suspended"
}
