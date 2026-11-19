"use client"

import { useState, type FormEvent } from "react"

import { useCreatorStore } from "@/components/creator/creator-store"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export function ProfileForm({ name }: { name: string }) {
  const saving = useCreatorStore((state) => state.profileSaving)
  const [displayName, setDisplayName] = useState(name)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const savedName = await useCreatorStore.getState().saveProfile({
      name: displayName,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined,
    })
    if (savedName) {
      setDisplayName(savedName)
      setCurrentPassword("")
      setNewPassword("")
    }
  }

  return (
    <form onSubmit={submit} className="min-w-0">
      <Card>
        <CardHeader className="border-b border-border/60 pb-5">
          <CardTitle>Profile &amp; Credentials</CardTitle>
          <CardDescription>
            Update how you appear or change your authentication password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <section aria-labelledby="profile-details-heading">
            <h2
              id="profile-details-heading"
              className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
            >
              Public Profile
            </h2>
            <FieldGroup className="mt-3">
              <Field>
                <FieldLabel htmlFor="profile-name">Display Name</FieldLabel>
                <Input
                  id="profile-name"
                  name="name"
                  required
                  minLength={2}
                  maxLength={80}
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="h-10 text-base sm:text-sm"
                />
                <FieldDescription>
                  This name is displayed as the creator on your published audio
                  tiles.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </section>

          <Separator className="border-border/60" />

          <section aria-labelledby="password-heading">
            <h2
              id="password-heading"
              className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
            >
              Change Password
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Leave both password fields blank to retain your existing password.
            </p>
            <FieldGroup className="mt-4 space-y-4">
              <Field>
                <FieldLabel htmlFor="profile-current-password">
                  Current Password
                </FieldLabel>
                <Input
                  id="profile-current-password"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="••••••••••••"
                  className="h-10 text-base sm:text-sm"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="profile-new-password">
                  New Password
                </FieldLabel>
                <Input
                  id="profile-new-password"
                  name="newPassword"
                  type="password"
                  minLength={10}
                  maxLength={128}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="••••••••••••"
                  className="h-10 text-base sm:text-sm"
                />
                <FieldDescription>
                  Requires at least 10 characters.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </section>
        </CardContent>
        <CardFooter className="justify-end border-t border-border/60 pt-5">
          <Button
            type="submit"
            disabled={saving}
            variant="primary"
            size="md"
            className="min-h-[44px] w-full font-medium sm:w-auto"
          >
            {saving ? "Saving changes…" : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
