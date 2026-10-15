import { CreatorUploads } from "@/components/creator/CreatorUploads"

export const metadata = {
  title: "Manage uploads",
  robots: { index: false, follow: false },
}

export default function CreatorUploadsPage() {
  return (
    <section>
      <p className="text-sm text-muted-foreground">Creator tools</p>
      <h1 className="mt-1 text-3xl font-black">Manage uploads</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Search and manage your sounds. Published sound edits are sent back for
        moderator review.
      </p>
      <CreatorUploads />
    </section>
  )
}
