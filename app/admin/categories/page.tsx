import { AdminCategories } from "@/components/admin/AdminCategories"

export const metadata = {
  title: "Manage categories",
  robots: { index: false, follow: false },
}

export default function AdminCategoriesPage() {
  return <AdminCategories />
}
