"use client"
import { useEffect } from "react"
import { X, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRestTimer } from "@/hooks/useRestTimer"
import { REST_TIMER_PRESETS } from "@/lib/constants"
import { formatDuration } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface Props {
  defaultSeconds?: number
}

export function RestTimer({ defaultSeconds = 90 }: Props) {
  const { active, remaining, total, start, stop } = useRestTimer()

  const progress = total > 0 ? remaining / total : 0
  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="bento-card space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted-foreground">Rest Timer</p>
        {active && (
          <Button variant="ghost" size="icon-sm" onClick={stop}>
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* Ring */}
      <div className="flex justify-center">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle
              cx="48" cy="48" r="40"
              strokeWidth="6"
              className="stroke-secondary fill-none"
            />
            <circle
              cx="48" cy="48" r="40"
              strokeWidth="6"
              className={cn("fill-none transition-all duration-1000", active ? "stroke-neon-green" : "stroke-muted")}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={active ? strokeDashoffset : circumference}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-2xl font-bold tabular-nums", active ? "text-neon-green" : "text-muted-foreground")}>
              {active ? formatDuration(remaining) : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {REST_TIMER_PRESETS.map((preset) => (
          <Button
            key={preset.seconds}
            variant={active && remaining <= preset.seconds && remaining > preset.seconds - 30 ? "neon" : "outline"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => start(preset.seconds)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
