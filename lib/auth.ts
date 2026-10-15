import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { z } from "zod"

import { User } from "@/models"
import { connectToDatabase } from "@/lib/db/mongoose"
import {
  enforceRateLimit,
  getRequestSubject,
  RateLimitError,
} from "@/lib/rate-limit"
import { createHash } from "node:crypto"

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(input) {
        const credentials = credentialsSchema.safeParse(input)
        if (!credentials.success) return null

        const subject = await getRequestSubject()
        const emailHash = createHash("sha256")
          .update(credentials.data.email.toLowerCase())
          .digest("hex")
        try {
          await enforceRateLimit("login", subject, 10, 900)
          await enforceRateLimit("login-email", emailHash, 20, 3600)
        } catch (error) {
          if (error instanceof RateLimitError) return null
          throw error
        }

        await connectToDatabase()
        const user = (await User.findOne({
          email: credentials.data.email.toLowerCase(),
          status: "active",
        }).select("+passwordHash")) as {
          _id: { toString(): string }
          name: string
          email: string
          passwordHash: string
          role: "user" | "admin"
        } | null

        if (
          !user ||
          !(await compare(credentials.data.password, user.passwordHash))
        ) {
          return null
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id)
        session.user.role = token.role === "admin" ? "admin" : "user"
      }
      return session
    },
  },
})
