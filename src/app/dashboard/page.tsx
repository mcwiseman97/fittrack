import type { Metadata } from "next"
import { Suspense } from "react"
import { db } from "@/db"
import { foodLog, profile, workoutSessions } from "@/db/schema"
import { eq } from "drizzle-orm"
import { todayStr, formatDateStr } from "@/lib/utils"
import { MacroRingsGroup } from "@/components/dashboard/MacroRingsGroup"
import { CalorieProgressBar } from "@/components/dashboard/CalorieProgressBar"
import { TodayWorkoutWidget } from "@/components/dashboard/TodayWorkoutWidget"
import { ConsistencyHeatmap } from "@/components/dashboard/ConsistencyHeatmap"
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton"
import { format } from "date-fns"

export const metadata: Metadata = { title: "Dashboard" }
export const revalidate = 0

async function getDashboardData() {
  const today = todayStr()

  const [userProfile] = await db.select().from(profile).where(eq(profile.id, 1))
  const todayEntries = await db.select().from(foodLog).where(eq(foodLog.dateStr, today))

  const totals = todayEntries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      proteinG: acc.proteinG + e.proteinG,
      carbsG: acc.carbsG + e.carbsG,
      fatG: acc.fatG + e.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  )

  // Heatmap data — inline for RSC
  const { subDays } = await import("date-fns")
  const startDate = format(subDays(new Date(), 363), "yyyy-MM-dd")

  const [sessions, allLogs] = await Promise.all([
    db.select({ dateStr: workoutSessions.dateStr }).from(workoutSessions),
    db.select({ dateStr: foodLog.dateStr, calories: foodLog.calories }).from(foodLog),
  ])

  const workoutMap = new Map<string, number>()
  for (const s of sessions) workoutMap.set(s.dateStr, (workoutMap.get(s.dateStr) ?? 0) + 1)

  const calorieMap = new Map<string, number>()
  for (const l of allLogs) calorieMap.set(l.dateStr, (calorieMap.get(l.dateStr) ?? 0) + l.calories)

  const targetCals = userProfile?.targetCalories ?? 2000
  const heatmapDays = Array.from({ length: 364 }, (_, i) => {
    const d = subDays(new Date(), 363 - i)
    const dateStr = format(d, "yyyy-MM-dd")
    return {
      dateStr,
      workoutCount: workoutMap.get(dateStr) ?? 0,
      caloriePercent: Math.min((calorieMap.get(dateStr) ?? 0) / targetCals, 1),
    }
  })

  return {
    summary: {
      ...totals,
      targetCalories: userProfile?.targetCalories ?? 2000,
      targetProteinG: userProfile?.targetProteinG ?? 150,
      targetCarbsG: userProfile?.targetCarbsG ?? 200,
      targetFatG: userProfile?.targetFatG ?? 65,
    },
    heatmapDays,
    today,
  }
}

export default async function DashboardPage() {
  const { summary, heatmapDays, today } = await getDashboardData()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{formatDateStr(today)}</p>
      </div>

      {/* Macro rings */}
      <MacroRingsGroup summary={summary} />

      {/* Calorie bar + today's workout side by side on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CalorieProgressBar summary={summary} />
        <Suspense fallback={<div className="bento-card animate-pulse h-32" />}>
          <TodayWorkoutWidget />
        </Suspense>
      </div>

      {/* 52-week heatmap */}
      <ConsistencyHeatmap data={heatmapDays} />
    </div>
  )
}
