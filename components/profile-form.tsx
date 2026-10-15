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
        <CardHeader className="border-b">
          <CardTitle>Profile &amp; password</CardTitle>
          <CardDescription>
            Update how you appear or choose a new password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <section aria-labelledby="profile-details-heading">
            <h2 id="profile-details-heading" className="text-sm font-semibold">
              Profile details
            </h2>
            <FieldGroup className="mt-4">
              <Field>
                <FieldLabel htmlFor="profile-name">Display name</FieldLabel>
                <Input
                  id="profile-name"
                  name="name"
                  required
                  minLength={2}
                  maxLength={80}
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="h-10"
                />
                <FieldDescription>
                  This name is visible to other people in the community.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </section>

          <Separator />

          <section aria-labelledby="password-heading">
            <h2 id="password-heading" className="text-sm font-semibold">
              Change password
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Leave both password fields blank to keep your current password.
            </p>
            <FieldGroup className="mt-4">
              <Field>
                <FieldLabel htmlFor="profile-current-password">
                  Current password
                </FieldLabel>
                <Input
                  id="profile-current-password"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="h-10"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="profile-new-password">
                  New password
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
                  className="h-10"
                />
                <FieldDescription>
                  Choose at least 10 characters.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </section>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={saving} size="md">
            {saving ? "Saving changes…" : "Save changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
