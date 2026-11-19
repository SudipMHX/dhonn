import { CreatorUploads } from "@/components/creator/CreatorUploads"
import { Music2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Manage uploads",
  robots: { index: false, follow: false },
}

export default function CreatorUploadsPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="border-b border-border/80 pb-6">
        <Badge variant="indigo" className="mb-2.5 gap-1.5">
          <Music2 className="size-3" />
          <span>Creator Catalog</span>
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Manage Uploads
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Audit your audio submissions, review moderation notes, and edit
          metadata.
        </p>
      </div>

      <CreatorUploads />
    </div>
  )
}
