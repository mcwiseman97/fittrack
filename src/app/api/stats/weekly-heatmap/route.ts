import { NextResponse } from "next/server"
import { db } from "@/db"
import { workoutSessions, foodLog, profile } from "@/db/schema"
import { eq, gte } from "drizzle-orm"
import { format } from "date-fns"
import type { HeatmapDay } from "@/types"

export async function GET() {
  const today = new Date()
  const year = today.getFullYear()
  // Full calendar year: Jan 1 → Dec 31
  const yearStart = new Date(year, 0, 1)
  const yearEnd = new Date(year, 11, 31)
  const startDate = format(yearStart, "yyyy-MM-dd")

  const [userProfile] = await db.select().from(profile).where(eq(profile.id, 1))
  const targetCalories = userProfile?.targetCalories ?? 2000

  // Get workout counts per day (only past/present dates will have data)
  const sessions = await db
    .select({ dateStr: workoutSessions.dateStr })
    .from(workoutSessions)
    .where(gte(workoutSessions.dateStr, startDate))

  const workoutMap = new Map<string, number>()
  for (const s of sessions) {
    workoutMap.set(s.dateStr, (workoutMap.get(s.dateStr) ?? 0) + 1)
  }

  // Get calorie totals per day
  const logs = await db
    .select({ dateStr: foodLog.dateStr, calories: foodLog.calories })
    .from(foodLog)
    .where(gte(foodLog.dateStr, startDate))

  const calorieMap = new Map<string, number>()
  for (const l of logs) {
    calorieMap.set(l.dateStr, (calorieMap.get(l.dateStr) ?? 0) + l.calories)
  }

  // Build full-year array (Jan 1 → Dec 31); future dates will have zero counts
  const days: HeatmapDay[] = []
  const msPerDay = 24 * 60 * 60 * 1000
  const totalDays = Math.round((yearEnd.getTime() - yearStart.getTime()) / msPerDay) + 1
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(yearStart.getTime() + i * msPerDay)
    const dateStr = format(d, "yyyy-MM-dd")
    const workoutCount = workoutMap.get(dateStr) ?? 0
    const calTotal = calorieMap.get(dateStr) ?? 0
    const caloriePercent = calTotal > 0 ? Math.min(calTotal / targetCalories, 1) : 0
    days.push({ dateStr, workoutCount, caloriePercent })
  }

  return NextResponse.json(days)
}
