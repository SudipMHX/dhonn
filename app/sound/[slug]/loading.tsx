import { Skeleton } from "@/components/ui/skeleton"

export default function SoundDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main
        aria-busy="true"
        aria-label="Loading sound details"
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      >
        {/* Breadcrumb skeleton */}
        <div className="mb-6 flex items-center gap-2 sm:mb-8">
          <Skeleton className="h-4 w-12" />
          <span className="text-border">/</span>
          <Skeleton className="h-4 w-24" />
          <span className="text-border">/</span>
          <Skeleton className="h-4 w-28" />
        </div>

        <article className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
          {/* Hero waveform banner skeleton */}
          <div className="relative overflow-hidden bg-zinc-950 px-5 pt-5 pb-6 sm:px-8 sm:pt-7 sm:pb-8 lg:px-10">
            <div className="relative flex items-center justify-between gap-3">
              <Skeleton className="h-8 w-28 rounded-full bg-white/10" />
              <Skeleton className="h-8 w-16 rounded-full bg-white/10" />
            </div>

            <div className="flex h-32 items-center justify-center gap-[3px] overflow-hidden py-4 sm:h-40 sm:gap-1">
              {Array.from({ length: 64 }, (_, index) => (
                <Skeleton
                  key={index}
                  className="w-1 shrink-0 rounded-full bg-white/15 sm:w-[5px]"
                  style={{
                    height: `${14 + ((index * 37) % 74)}%`,
                  }}
                />
              ))}
            </div>

            <div className="relative flex items-center justify-between">
              <Skeleton className="h-4 w-32 bg-white/10" />
              <Skeleton className="hidden h-4 w-24 bg-white/10 sm:block" />
            </div>
          </div>

          {/* Main content skeleton */}
          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
            <section className="min-w-0 space-y-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>

              <Skeleton className="h-9 w-3/4 max-w-lg" />
              <Skeleton className="h-16 w-full max-w-xl" />

              <Skeleton className="h-56 w-full rounded-2xl" />

              <div className="grid grid-cols-3 gap-3 pt-4">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
            </section>

            <aside className="h-fit rounded-xl border border-border/80 bg-secondary/30 p-6 space-y-4">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </aside>
          </div>
        </article>
      </main>
    </div>
  )
}
