import Link from "next/link"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { getAdminOverview } from "@/lib/services/admin"

export const metadata = {
  title: "Admin overview",
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const stats = await getAdminOverview()
  const cards = [
    ["Published sounds", stats.sounds, "/admin/sounds"],
    ["Pending uploads", stats.pendingUploads, "/admin/uploads"],
    ["Open reports", stats.reports, "/admin/reports"],
    ["Plays · last 24h", stats.playsToday, "/admin/sounds"],
    ["Registered users (approx.)", stats.users, "/admin/users"],
    ["Categories (approx.)", stats.categories, "/admin/categories"],
  ] as const
  return (
    <div>
      <p className="text-sm text-slate-500">Platform operations</p>
      <h1 className="mt-1 text-3xl font-black">Admin overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, href]) => (
          <Link
            href={href}
            prefetch={false}
            key={label}
            className="group rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Card className="h-full transition-colors group-hover:ring-primary/30">
              <CardContent className="pt-4">
                <CardDescription>{label}</CardDescription>
                <p className="mt-2 text-3xl font-black">
                  {value.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Alert className="mt-8 border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-100">
        <AlertDescription>
          Review pending creator uploads before publication. Copyright reports
          and removal decisions are recorded for auditability.
        </AlertDescription>
      </Alert>
    </div>
  )
}
