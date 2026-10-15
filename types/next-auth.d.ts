import "next-auth"

declare module "next-auth" {
  interface User {
    role: "user" | "admin"
  }

  interface Session {
    user: {
      id: string
      role: "user" | "admin"
    } & NonNullable<Session["user"]>
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: "user" | "admin"
  }
}
