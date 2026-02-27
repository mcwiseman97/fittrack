import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { foodLog } from "@/db/schema"
import { eq, and, asc } from "drizzle-orm"
import { AddFoodLogSchema } from "@/lib/validators"
import { todayStr } from "@/lib/utils"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dateStr = searchParams.get("date") ?? todayStr()

  const entries = await db
    .select()
    .from(foodLog)
    .where(eq(foodLog.dateStr, dateStr))
    .orderBy(asc(foodLog.loggedAt))

  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = AddFoodLogSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const [entry] = await db.insert(foodLog).values(parsed.data).returning()
  return NextResponse.json(entry, { status: 201 })
}
