import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white/75 dark:border-slate-800 dark:bg-slate-950/75">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 dark:text-slate-300">
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            dhonn.
          </p>
          <p>Small sounds. Big moments. Made for sharing.</p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-x-5 gap-y-2"
        >
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/report">Copyright & reports</Link>
        </nav>
      </div>
    </footer>
  )
}
