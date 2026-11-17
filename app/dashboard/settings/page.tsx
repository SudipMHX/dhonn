import { ProfileForm } from "@/components/profile-form"
import { BadgeCheck, KeyRound, Settings2, UserRound } from "lucide-react"

import { CreatorProfileSummary } from "@/components/creator/creator-account-name"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireUser } from "@/lib/authz"

export const metadata = {
  title: "Account settings",
  robots: { index: false, follow: false },
}

export default async function AccountSettingsPage() {
  const user = await requireUser()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="indigo" className="mb-2.5 gap-1.5">
            <Settings2 className="size-3" />
            <span>Preferences</span>
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Account Settings
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Manage your public display name and account security credentials.
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-1.5 py-1 text-xs">
          <BadgeCheck className="size-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Private to you</span>
        </Badge>
      </div>

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.9fr)]">
        <ProfileForm name={user.name} />

        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound className="size-4 text-indigo-600 dark:text-indigo-400" />
                <span>Creator Identity</span>
              </CardTitle>
              <CardDescription>
                How you appear across community sound pages and attribution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreatorProfileSummary name={user.name} role={user.role} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="size-4 text-indigo-600 dark:text-indigo-400" />
                <span>Security Guidelines</span>
              </CardTitle>
              <CardDescription>
                Best practices for safeguarding your audio creator account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p className="flex gap-2">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                <span>Use a unique password with at least 10 characters.</span>
              </p>
              <p className="flex gap-2">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                <span>Your existing password is required to authorize password updates.</span>
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
