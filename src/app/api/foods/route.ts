import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { foods } from "@/db/schema"
import { like, or, desc, asc } from "drizzle-orm"
import { CreateFoodSchema } from "@/lib/validators"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100)

  let results
  if (q && q.length > 0) {
    results = await db
      .select()
      .from(foods)
      .where(
        or(
          like(foods.name, `%${q}%`),
          like(foods.brand, `%${q}%`)
        )
      )
      .orderBy(asc(foods.name))
      .limit(limit)
  } else {
    results = await db
      .select()
      .from(foods)
      .orderBy(desc(foods.createdAt))
      .limit(limit)
  }

  return NextResponse.json(results)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = CreateFoodSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const [food] = await db.insert(foods).values(parsed.data).returning()
  return NextResponse.json(food, { status: 201 })
}
