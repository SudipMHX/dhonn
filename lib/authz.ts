import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db/mongoose"
import { User } from "@/models"

export async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const user = await getActiveUser(session.user.id)
  if (!user) redirect("/login")
  return user
}

export async function requireAdmin() {
  const user = await requireUser()
  if (user.role !== "admin") redirect("/dashboard")
  return user
}

export async function getApiUser() {
  const session = await auth()
  return session?.user?.id ? getActiveUser(session.user.id) : null
}

export async function getApiAdmin() {
  const user = await getApiUser()
  return user?.role === "admin" ? user : null
}

async function getActiveUser(id: string) {
  await connectToDatabase()
  return User.findOne({ _id: id, status: "active" })
    .select("_id name email role")
    .lean()
    .then((user) =>
      user
        ? {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          }
        : null
    )
}
