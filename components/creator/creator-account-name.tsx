"use client"

import { useCreatorStore } from "@/components/creator/creator-store"

export function CreatorAccountName({ name }: { name: string }) {
  const profileName = useCreatorStore((state) => state.profileName)
  return <>{profileName ?? name}</>
}

export function CreatorProfileSummary({
  name,
  role,
}: {
  name: string
  role: string
}) {
  const profileName = useCreatorStore((state) => state.profileName)
  const displayName = profileName ?? name

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {displayName.trim().charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{displayName}</p>
        <p className="text-xs text-muted-foreground capitalize">
          {role} account
        </p>
      </div>
    </div>
  )
}
