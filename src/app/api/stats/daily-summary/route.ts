import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { foodLog, profile } from "@/db/schema"
import { eq } from "drizzle-orm"
import { todayStr } from "@/lib/utils"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dateStr = searchParams.get("date") ?? todayStr()

  const [userProfile] = await db.select().from(profile).where(eq(profile.id, 1))
  const entries = await db.select().from(foodLog).where(eq(foodLog.dateStr, dateStr))

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      proteinG: acc.proteinG + e.proteinG,
      carbsG: acc.carbsG + e.carbsG,
      fatG: acc.fatG + e.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  )

  return NextResponse.json({
    dateStr,
    ...totals,
    targetCalories: userProfile?.targetCalories ?? 2000,
    targetProteinG: userProfile?.targetProteinG ?? 150,
    targetCarbsG: userProfile?.targetCarbsG ?? 200,
    targetFatG: userProfile?.targetFatG ?? 65,
  })
}
