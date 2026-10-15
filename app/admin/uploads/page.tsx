import { AdminUploads } from "@/components/admin/AdminUploads"

export const metadata = {
  title: "Review uploads",
  robots: { index: false, follow: false },
}

export default function AdminUploadsPage() {
  return <AdminUploads />
}
