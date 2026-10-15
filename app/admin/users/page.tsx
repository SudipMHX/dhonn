import { AdminUsers } from "@/components/admin/AdminUsers"

export const metadata = {
  title: "Manage users",
  robots: { index: false, follow: false },
}

export default function AdminUsersPage() {
  return <AdminUsers />
}
