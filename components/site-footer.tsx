import Link from "next/link"
import { Volume2 } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="mt-16 hidden border-t border-border/80 bg-card/40 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] backdrop-blur-sm md:mt-20 md:block md:pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex touch-manipulation items-center gap-2 transition-opacity hover:opacity-90 active:scale-95"
              aria-label="dhonn. home"
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
                <Volume2 className="size-3.5" strokeWidth={2.5} />
              </div>
              <span className="font-heading text-base font-bold tracking-tight text-foreground">
                dhonn
                <span className="text-indigo-600 dark:text-indigo-400">.</span>
              </span>
            </Link>
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
              Curated short audio for streams, creators, and conversations.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-5 gap-y-2.5 text-xs font-medium text-muted-foreground"
          >
            <Link
              href="/about"
              className="touch-manipulation py-1 transition-colors hover:text-foreground active:scale-95"
            >
              About
            </Link>
            <Link
              href="/category"
              className="touch-manipulation py-1 transition-colors hover:text-foreground active:scale-95"
            >
              Categories
            </Link>
            <Link
              href="/featured"
              className="touch-manipulation py-1 transition-colors hover:text-foreground active:scale-95"
            >
              Featured
            </Link>
            <Link
              href="/contact"
              className="touch-manipulation py-1 transition-colors hover:text-foreground active:scale-95"
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              className="touch-manipulation py-1 transition-colors hover:text-foreground active:scale-95"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="touch-manipulation py-1 transition-colors hover:text-foreground active:scale-95"
            >
              Terms of Service
            </Link>
            <Link
              href="/report"
              className="touch-manipulation py-1 transition-colors hover:text-foreground active:scale-95"
            >
              Copyright &amp; Reports
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-border/50 pt-6 text-xs text-muted-foreground/80 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} dhonn. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Built for audio enthusiasts &amp; creators</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
