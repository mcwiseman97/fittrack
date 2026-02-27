"use client"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { format, parseISO } from "date-fns"
import type { HeatmapDay } from "@/types"

interface Props {
  data: HeatmapDay[]
}

// 52 columns × 7 rows = 364 days
const WEEK_COUNT = 52
const DAY_LABELS = ["", "M", "", "W", "", "F", ""]

function getColor(day: HeatmapDay): string {
  if (day.workoutCount > 0) {
    // Workout intensity: purple
    const intensity = Math.min(day.workoutCount / 2, 1)
    const alpha = 0.3 + intensity * 0.7
    return `rgba(167, 139, 250, ${alpha})`
  }
  if (day.caloriePercent > 0.5) {
    // Nutrition tracked: blue
    const alpha = 0.2 + day.caloriePercent * 0.5
    return `rgba(96, 165, 250, ${alpha})`
  }
  return "hsl(var(--secondary))"
}

export function ConsistencyHeatmap({ data }: Props) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null)

  // Pad data to fill 52 weeks × 7 days = 364 days
  const padded = [...data]
  while (padded.length < WEEK_COUNT * 7) {
    padded.unshift({ dateStr: "", workoutCount: 0, caloriePercent: 0 })
  }

  // Group into weeks (columns)
  const weeks: HeatmapDay[][] = []
  for (let w = 0; w < WEEK_COUNT; w++) {
    weeks.push(padded.slice(w * 7, (w + 1) * 7))
  }

  // Month labels: find where months change
  const monthLabels: { week: number; label: string }[] = []
  let lastMonth = ""
  weeks.forEach((week, wi) => {
    const first = week.find((d) => d.dateStr)
    if (first) {
      const month = format(parseISO(first.dateStr), "MMM")
      if (month !== lastMonth) {
        monthLabels.push({ week: wi, label: month })
        lastMonth = month
      }
    }
  })

  return (
    <TooltipProvider>
      <div className="bento-card space-y-3 overflow-x-auto">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-muted-foreground whitespace-nowrap">52-Week Activity</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(167,139,250,0.8)" }} />
              Workout
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(96,165,250,0.6)" }} />
              Nutrition
            </span>
          </div>
        </div>

        <div className="min-w-[580px]">
          {/* Month labels */}
          <div className="flex mb-1 pl-6">
            {weeks.map((_, wi) => {
              const label = monthLabels.find((m) => m.week === wi)
              return (
                <div key={wi} className="flex-1 text-[9px] text-muted-foreground">
                  {label?.label ?? ""}
                </div>
              )
            })}
          </div>

          <div className="flex gap-0.5">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DAY_LABELS.map((d, i) => (
                <div key={i} className="w-4 h-[11px] text-[9px] text-muted-foreground flex items-center">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) => (
                  <Tooltip key={di}>
                    <TooltipTrigger asChild>
                      <div
                        className="w-[11px] h-[11px] rounded-sm cursor-pointer transition-transform hover:scale-125"
                        style={{ background: day.dateStr ? getColor(day) : "transparent" }}
                        onMouseEnter={() => day.dateStr && setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                      />
                    </TooltipTrigger>
                    {day.dateStr && (
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">{format(parseISO(day.dateStr), "MMM d, yyyy")}</p>
                        {day.workoutCount > 0 && (
                          <p className="text-neon-purple">{day.workoutCount} workout{day.workoutCount > 1 ? "s" : ""}</p>
                        )}
                        {day.caloriePercent > 0 && (
                          <p className="text-neon-blue">{Math.round(day.caloriePercent * 100)}% of calories</p>
                        )}
                        {day.workoutCount === 0 && day.caloriePercent === 0 && (
                          <p className="text-muted-foreground">No activity</p>
                        )}
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
