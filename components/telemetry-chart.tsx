"use client"

import { useId, useState } from "react"
import { Activity, ArrowUpRight, AudioLines, Radio } from "lucide-react"

export type TelemetryMetric = {
  label: string
  value: string | number
  note?: string
}

export type PrimaryMetric = {
  label: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
}

const DEFAULT_POINTS = [
  24, 38, 30, 48, 42, 68, 55, 78, 62, 85, 70, 94, 82, 90, 76, 88,
]
const DEFAULT_BARS = [
  30, 45, 38, 62, 48, 75, 42, 80, 56, 92, 44, 70, 52, 86, 38, 74, 48, 88, 54,
  95, 42, 65, 36, 78, 50, 82, 46, 68, 40, 76, 52, 85,
]

export function TelemetryChart({
  title,
  subtitle,
  badge = "LIVE TELEMETRY",
  primaryMetric,
  metrics = [],
  points = DEFAULT_POINTS,
  bars = DEFAULT_BARS,
  timeLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Live"],
}: {
  title: string
  subtitle?: string
  badge?: string
  primaryMetric: PrimaryMetric
  metrics?: TelemetryMetric[]
  points?: number[]
  bars?: number[]
  timeLabels?: string[]
}) {
  const gradientId = useId()
  const [activeTab, setActiveTab] = useState<"waveform" | "traffic">("traffic")

  // Generate smooth SVG path for the area/line curve
  const width = 800
  const height = 180
  const paddingX = 10
  const paddingY = 20

  const availableWidth = width - paddingX * 2
  const availableHeight = height - paddingY * 2

  const maxVal = Math.max(...points, 100)
  const minVal = Math.min(...points, 0)
  const range = maxVal - minVal || 1

  const coords = points.map((val, idx) => {
    const x = paddingX + (idx / (points.length - 1)) * availableWidth
    const y = height - paddingY - ((val - minVal) / range) * availableHeight
    return { x, y }
  })

  // Build curved path using bezier smoothing
  let linePath = `M ${coords[0].x} ${coords[0].y}`
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i]
    const next = coords[i + 1]
    const mx = (curr.x + next.x) / 2
    linePath += ` C ${mx} ${curr.y}, ${mx} ${next.y}, ${next.x} ${next.y}`
  }

  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-zinc-950 p-4 text-white shadow-xl sm:p-6 dark:border-border/60">
      {/* Background ambient radial gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -right-20 -z-10 size-96 rounded-full bg-indigo-500/15 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-20 -z-10 size-96 rounded-full bg-violet-500/15 blur-[100px]"
      />

      {/* Top Bar: Title, Badge, and View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex size-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-xs font-semibold tracking-wider text-indigo-400 uppercase">
            {badge}
          </span>
          <span className="text-zinc-600">/</span>
          <h2 className="truncate text-sm font-bold tracking-tight text-white">
            {title}
          </h2>
        </div>

        {/* View toggle */}
        <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("traffic")}
            className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium transition-all active:scale-95 sm:min-h-0 sm:py-1 sm:text-[11px] ${
              activeTab === "traffic"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Traffic Curve
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("waveform")}
            className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium transition-all active:scale-95 sm:min-h-0 sm:py-1 sm:text-[11px] ${
              activeTab === "waveform"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Audio Soundwave
          </button>
        </div>
      </div>

      {subtitle && (
        <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-zinc-400">
          {subtitle}
        </p>
      )}

      {/* Primary Hero Metric Callout */}
      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-4 border-t border-white/10 pt-4">
        <div>
          <p className="text-xs font-medium text-zinc-400">
            {primaryMetric.label}
          </p>
          <div className="mt-1 flex items-baseline gap-2.5 sm:gap-3">
            <span className="font-mono text-2xl font-extrabold tracking-tight text-white tabular-nums sm:text-4xl">
              {primaryMetric.value}
            </span>
            {primaryMetric.change && (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                <ArrowUpRight className="size-3" />
                <span>{primaryMetric.change}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-zinc-400 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <Radio className="size-3.5 animate-pulse text-indigo-400" />
            <span>48kHz Studio</span>
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            <Activity className="size-3.5 text-emerald-400" />
            <span>&lt;80ms Response</span>
          </div>
        </div>
      </div>

      {/* Graph Area */}
      <div className="relative mt-4">
        {activeTab === "traffic" ? (
          <div className="relative h-36 w-full overflow-hidden sm:h-44">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="h-full w-full overflow-visible"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id={`${gradientId}-area`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#6366f1" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                  id={`${gradientId}-line`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>

              {/* Horizontal guide lines */}
              <line
                x1="0"
                y1={height * 0.25}
                x2={width}
                y2={height * 0.25}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
              <line
                x1="0"
                y1={height * 0.5}
                x2={width}
                y2={height * 0.5}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
              <line
                x1="0"
                y1={height * 0.75}
                x2={width}
                y2={height * 0.75}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />

              {/* Area & Line */}
              <path d={areaPath} fill={`url(#${gradientId}-area)`} />
              <path
                d={linePath}
                fill="none"
                stroke={`url(#${gradientId}-line)`}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Peak data points */}
              {coords.map((pt, idx) => {
                if (idx % 3 !== 0 && idx !== coords.length - 1) return null
                return (
                  <g key={idx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      className="fill-indigo-400 stroke-zinc-950 stroke-2"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="7"
                      className="animate-ping fill-indigo-400/20"
                    />
                  </g>
                )
              })}
            </svg>
          </div>
        ) : (
          /* Soundwave Bars View */
          <div
            className="flex h-36 items-end gap-1 overflow-hidden py-3 sm:h-44 sm:gap-1.5"
            aria-hidden="true"
          >
            {bars.map((height, index) => (
              <span
                key={index}
                className="flex-1 rounded-full bg-gradient-to-t from-indigo-600 via-indigo-400 to-violet-300 opacity-90 transition-all duration-300 hover:opacity-100 hover:brightness-125"
                style={{ height: `${Math.max(12, Math.min(100, height))}%` }}
              />
            ))}
          </div>
        )}

        {/* Time Axis Labels */}
        <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 font-mono text-[9px] text-zinc-500 sm:text-[10px]">
          {timeLabels.map((lbl, idx) => (
            <span
              key={idx}
              className={
                idx % 2 === 1 ? "xs:inline hidden sm:inline" : undefined
              }
            >
              {lbl}
            </span>
          ))}
        </div>
      </div>

      {/* Telemetry Metrics Strip */}
      {metrics.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-2.5 border-t border-white/10 pt-4 sm:grid-cols-4 sm:gap-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="min-w-0 space-y-0.5">
              <p className="truncate font-mono text-[10px] text-zinc-400 sm:text-[11px]">
                {metric.label}
              </p>
              <p className="font-mono text-base font-bold tracking-tight text-white tabular-nums sm:text-xl">
                {metric.value}
              </p>
              {metric.note && (
                <p className="truncate text-[9px] text-zinc-500 sm:text-[10px]">
                  {metric.note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bottom Telemetry Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs">
        <div className="flex min-w-0 items-center gap-2 text-[11px] text-zinc-400">
          <span className="flex shrink-0 items-center gap-1 font-mono text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>Operational</span>
          </span>
          <span className="hidden text-zinc-600 sm:inline">·</span>
          <span className="hidden truncate sm:inline">
            Global edge CDN cached audio streaming
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1 font-mono text-[11px] text-indigo-400">
          <AudioLines className="size-3.5" />
          <span>dhonn.:telemetry</span>
        </div>
      </div>
    </div>
  )
}
