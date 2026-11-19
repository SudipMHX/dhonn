import { redirect } from "next/navigation"
import { Types } from "mongoose"

import { auth } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db/mongoose"
import { User } from "@/models"

export type SessionUserData = {
  id: string
  name: string
  email: string
  role: "user" | "admin"
}

let _mockSessionUser: SessionUserData | null | undefined = undefined

/**
 * Set a mock user for testing authentication and authorization flows.
 * Pass `null` to simulate unauthenticated requests, an object to simulate an authenticated user,
 * or `undefined` to restore standard session behavior.
 */
export function _setMockUserForTesting(
  user: SessionUserData | null | undefined
) {
  _mockSessionUser = user
}

export async function requireUser(): Promise<SessionUserData> {
  if (_mockSessionUser !== undefined) {
    if (!_mockSessionUser) redirect("/login")
    return _mockSessionUser
  }
  let session = null
  try {
    session = await auth()
  } catch {
    redirect("/login")
  }
  if (!session?.user?.id) redirect("/login")
  const user = await getActiveUser(session.user.id)
  if (!user) redirect("/login")
  return user
}

export async function requireAdmin(): Promise<SessionUserData> {
  const user = await requireUser()
  if (user.role !== "admin") redirect("/dashboard")
  return user
}

export async function getApiUser(): Promise<SessionUserData | null> {
  if (_mockSessionUser !== undefined) {
    return _mockSessionUser
  }
  try {
    const session = await auth()
    return session?.user?.id ? getActiveUser(session.user.id) : null
  } catch {
    return null
  }
}

export async function getApiAdmin(): Promise<SessionUserData | null> {
  const user = await getApiUser()
  return user?.role === "admin" ? user : null
}

async function getActiveUser(id: string): Promise<SessionUserData | null> {
  if (!id || typeof id !== "string" || !Types.ObjectId.isValid(id)) return null
  await connectToDatabase()
  return User.findOne({ _id: new Types.ObjectId(id), status: "active" })
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
