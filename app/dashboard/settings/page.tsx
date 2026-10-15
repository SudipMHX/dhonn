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
      <div className="flex flex-col gap-4 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3 gap-1.5">
            <Settings2 />
            Account
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Manage your profile and keep your account secure.
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-1.5 py-1">
          <BadgeCheck />
          Private to you
        </Badge>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(17rem,0.8fr)]">
        <ProfileForm name={user.name} />
        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-4 text-primary" />
                Your profile
              </CardTitle>
              <CardDescription>
                This is how your creator profile appears across dhonn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreatorProfileSummary name={user.name} role={user.role} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="size-4 text-primary" />
                Account security
              </CardTitle>
              <CardDescription>
                A few simple steps help keep your account protected.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p className="flex gap-2">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                Use a unique password with at least 10 characters.
              </p>
              <p className="flex gap-2">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                Your current password is required before changing it.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
