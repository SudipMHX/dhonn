import { Skeleton } from "@/components/ui/skeleton"

export default function SoundDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950">
      <main
        aria-busy="true"
        aria-label="Loading sound details"
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8"
      >
        {/* Breadcrumb skeleton */}
        <div className="mb-6 flex items-center gap-2 sm:mb-8">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-3 rounded-sm" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-3 rounded-sm" />
          <Skeleton className="h-4 w-28" />
        </div>

        <article className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
          {/* Dark artwork / waveform skeleton */}
          <div className="relative overflow-hidden bg-[#100d20] px-5 pt-5 pb-6 sm:px-9 sm:pt-8 sm:pb-8 lg:px-12 lg:pt-10">
            <div className="pointer-events-none absolute -top-24 left-1/4 size-72 rounded-full bg-violet-600/20 blur-[90px]" />
            <div className="pointer-events-none absolute -right-16 bottom-[-120px] size-72 rounded-full bg-fuchsia-500/15 blur-[90px]" />

            <div className="relative flex items-center justify-between gap-3">
              <Skeleton className="h-9 w-32 rounded-full bg-white/10" />
              <Skeleton className="h-9 w-20 rounded-full bg-white/10" />
            </div>

            {/* Decorative waveform */}
            <div className="flex h-36 items-center justify-center gap-[3px] overflow-hidden py-5 sm:h-48 sm:gap-1">
              {Array.from({ length: 64 }, (_, index) => (
                <Skeleton
                  key={index}
                  className="w-1 shrink-0 rounded-full bg-white/20 sm:w-[5px]"
                  style={{
                    height: `${12 + ((index * 37) % 76)}%`,
                    opacity: 0.45 + ((index % 7) / 7) * 0.55,
                  }}
                />
              ))}
            </div>

            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-36 bg-white/15" />
                <Skeleton className="h-4 w-52 bg-white/10" />
              </div>
              <Skeleton className="hidden h-4 w-40 bg-white/10 sm:block" />
            </div>
          </div>

          {/* Main content */}
          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 lg:p-10">
            <section className="min-w-0">
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>

              <Skeleton className="h-10 w-4/5 max-w-xl sm:h-12" />

              <div className="mt-5 max-w-2xl space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              {/* Playback controls */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Skeleton className="h-11 w-36 rounded-full" />
                <Skeleton className="h-11 w-11 rounded-full" />
                <Skeleton className="h-11 w-11 rounded-full" />
              </div>

              {/* Tags */}
              <div className="mt-8 border-t border-slate-100 pt-6 dark:border-white/[0.08]">
                <Skeleton className="mb-4 h-4 w-36" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-20 rounded-lg" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              </div>

              {/* Statistics */}
              <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 sm:p-4 dark:border-white/[0.08] dark:bg-white/[0.025]"
                  >
                    <Skeleton className="mb-3 size-4 rounded" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="mt-2 h-3 w-2/3" />
                  </div>
                ))}
              </div>
            </section>

            {/* Details sidebar */}
            <aside className="h-fit rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 sm:p-6 dark:border-white/[0.08] dark:bg-white/[0.025]">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>

              <div className="mt-6 divide-y divide-slate-200/80 dark:divide-white/[0.08]">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 py-4 first:pt-0"
                  >
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-slate-200/80 pt-4 dark:border-white/[0.08]">
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </aside>
          </div>
        </article>

        {/* Related sounds */}
        <section className="mt-12 space-y-6 sm:mt-16">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-48 sm:h-9 sm:w-56" />
              <Skeleton className="h-4 w-52" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="space-y-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 dark:border-white/10 dark:bg-slate-900"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="size-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
