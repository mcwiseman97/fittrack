import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { exercises } from "@/db/schema"
import { like, or, asc, eq } from "drizzle-orm"
import { CreateExerciseSchema } from "@/lib/validators"
import { seedExercises } from "@/db/seed"

let seeded = false

export async function GET(req: NextRequest) {
  if (!seeded) {
    await seedExercises()
    seeded = true
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()
  const category = searchParams.get("category")
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100"), 500)

  let query = db.select().from(exercises).$dynamic()

  if (q && q.length > 0) {
    query = query.where(like(exercises.name, `%${q}%`))
  }

  const results = await query.orderBy(asc(exercises.name)).limit(limit)
  return NextResponse.json(results)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = CreateExerciseSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const [exercise] = await db
    .insert(exercises)
    .values({ ...parsed.data, isCustom: true })
    .returning()
  return NextResponse.json(exercise, { status: 201 })
}
