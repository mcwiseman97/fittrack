import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { foods } from "@/db/schema"
import { eq } from "drizzle-orm"
import { UpdateFoodSchema } from "@/lib/validators"

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const [food] = await db.select().from(foods).where(eq(foods.id, id))
  if (!food) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(food)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const body = await req.json()
  const parsed = UpdateFoodSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const [updated] = await db.update(foods).set(parsed.data).where(eq(foods.id, id)).returning()
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  await db.delete(foods).where(eq(foods.id, id))
  return NextResponse.json({ ok: true })
}
