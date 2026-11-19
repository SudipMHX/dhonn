import type { ComponentType } from "react"
import { AudioLines, Sparkles } from "lucide-react"

export type TelemetryStat = {
  label: string
  value: string | number
  sublabel?: string
}

const DEFAULT_BAR_HEIGHTS = [
  32, 54, 42, 68, 50, 85, 46, 72, 38, 80, 58, 92, 44, 66, 48, 88, 35, 75, 52,
  95, 40, 62, 30, 78, 56, 84, 45, 69, 36, 76, 54, 86,
]

export function AmbientActivityChart({
  title,
  badge,
  subtitle,
  bars = DEFAULT_BAR_HEIGHTS,
  telemetry = [],
  footerText = "Lossless 48kHz audio streams with sub-80ms playback latency",
  icon: Icon = Sparkles,
}: {
  title: string
  badge: string
  subtitle?: string
  bars?: number[]
  telemetry?: TelemetryStat[]
  footerText?: string
  icon?: ComponentType<{ className?: string }>
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-zinc-950 p-4 text-white shadow-xl sm:p-6 dark:border-border/60">
      {/* Background ambient lighting glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-10 -z-10 size-80 rounded-full bg-indigo-500/15 blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-10 -z-10 size-80 rounded-full bg-violet-500/15 blur-[90px]"
      />

      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 font-mono text-xs text-zinc-400">
        <span className="flex items-center gap-1.5 font-semibold tracking-wider text-indigo-400 uppercase">
          <Icon className="size-3.5" />
          <span>{title}</span>
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] tracking-wide text-zinc-300">
          {badge}
        </span>
      </div>

      {subtitle && (
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-zinc-400">
          {subtitle}
        </p>
      )}

      {/* Animated Waveform Visualizer Bars */}
      <div
        className="my-4 flex h-20 items-end gap-1 overflow-hidden sm:my-6 sm:h-28 sm:gap-1.5"
        aria-hidden="true"
      >
        {bars.map((height, index) => (
          <span
            key={index}
            className="flex-1 rounded-full bg-gradient-to-t from-indigo-500 via-indigo-400 to-violet-300 opacity-90 transition-all duration-300 hover:opacity-100 hover:brightness-125"
            style={{ height: `${Math.max(14, Math.min(100, height))}%` }}
          />
        ))}
      </div>

      {/* Telemetry Strip */}
      {telemetry.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2.5 border-t border-white/10 pt-4 sm:grid-cols-4 sm:gap-3">
          {telemetry.map((stat) => (
            <div key={stat.label} className="min-w-0 space-y-0.5">
              <p className="truncate font-mono text-[10px] text-zinc-400 sm:text-xs">
                {stat.label}
              </p>
              <p className="font-mono text-base font-bold tracking-tight text-white tabular-nums sm:text-lg">
                {stat.value}
              </p>
              {stat.sublabel && (
                <p className="truncate text-[9px] text-zinc-500 sm:text-[10px]">
                  {stat.sublabel}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs">
        <p className="truncate pr-2 text-[11px] text-zinc-400">{footerText}</p>
        <div className="flex shrink-0 items-center gap-1 font-mono text-indigo-400">
          <AudioLines className="size-4" />
        </div>
      </div>
    </div>
  )
}
