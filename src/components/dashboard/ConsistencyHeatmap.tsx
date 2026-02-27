"use client"
import { useState } from "react"
import { getDay, format, parseISO } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { HeatmapDay } from "@/types"

interface Props {
  data: HeatmapDay[]
}

const DAY_LABELS = ["", "M", "", "W", "", "F", ""]

const EMPTY_DAY: HeatmapDay = { dateStr: "", workoutCount: 0, caloriePercent: 0 }

function getColor(day: HeatmapDay, isFuture: boolean): string {
  if (isFuture) return "hsl(var(--muted))"
  if (day.workoutCount > 0) {
    const intensity = Math.min(day.workoutCount / 2, 1)
    const alpha = 0.3 + intensity * 0.7
    return `rgba(167, 139, 250, ${alpha})`
  }
  if (day.caloriePercent > 0.5) {
    const alpha = 0.2 + day.caloriePercent * 0.5
    return `rgba(96, 165, 250, ${alpha})`
  }
  return "hsl(var(--secondary))"
}

export function ConsistencyHeatmap({ data }: Props) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null)
  const todayStr = format(new Date(), "yyyy-MM-dd")

  // Align Jan 1 to the correct day-of-week row.
  // DAY_LABELS is Mon–Sun (Mon = row 0). getDay() returns Sun=0..Sat=6.
  // Convert: Mon(1)→0, Tue(2)→1, ... Sun(0)→6  via (getDay()+6)%7
  const firstDateStr = data[0]?.dateStr
  const padCount = firstDateStr ? (getDay(parseISO(firstDateStr)) + 6) % 7 : 0
  const WEEK_COUNT = Math.ceil((padCount + data.length) / 7)

  const padded: HeatmapDay[] = [
    ...Array(padCount).fill(EMPTY_DAY),
    ...data,
  ]
  while (padded.length < WEEK_COUNT * 7) padded.push(EMPTY_DAY)

  // Group into weeks (columns)
  const weeks: HeatmapDay[][] = []
  for (let w = 0; w < WEEK_COUNT; w++) {
    weeks.push(padded.slice(w * 7, (w + 1) * 7))
  }

  // Month labels: mark where each month first appears
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
          <p className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
            {new Date().getFullYear()} Activity
          </p>
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
                {week.map((day, di) => {
                  const isFuture = !!day.dateStr && day.dateStr > todayStr
                  return (
                    <Tooltip key={di}>
                      <TooltipTrigger asChild>
                        <div
                          className="w-[11px] h-[11px] rounded-sm transition-transform hover:scale-125"
                          style={{
                            background: day.dateStr ? getColor(day, isFuture) : "transparent",
                            cursor: day.dateStr && !isFuture ? "pointer" : "default",
                          }}
                          onMouseEnter={() => day.dateStr && !isFuture && setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                        />
                      </TooltipTrigger>
                      {day.dateStr && !isFuture && (
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
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
