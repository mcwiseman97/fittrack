import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { foodLog, foods } from "@/db/schema"
import { eq } from "drizzle-orm"
import { UpdateFoodLogSchema } from "@/lib/validators"

export async function PATCH(req: NextRequest, { params }: { params: { entryId: string } }) {
  const id = parseInt(params.entryId)
  const body = await req.json()
  const parsed = UpdateFoodLogSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // If servings changed, recalculate macros from the original food entry
  const [existing] = await db.select().from(foodLog).where(eq(foodLog.id, id))
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const newServings = parsed.data.servings ?? existing.servings
  const ratio = newServings / existing.servings

  const [updated] = await db
    .update(foodLog)
    .set({
      servings: newServings,
      mealType: parsed.data.mealType ?? existing.mealType,
      calories: existing.calories * ratio,
      proteinG: existing.proteinG * ratio,
      carbsG: existing.carbsG * ratio,
      fatG: existing.fatG * ratio,
      fiberG: existing.fiberG ? existing.fiberG * ratio : null,
    })
    .where(eq(foodLog.id, id))
    .returning()

  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { entryId: string } }) {
  const id = parseInt(params.entryId)
  await db.delete(foodLog).where(eq(foodLog.id, id))
  return NextResponse.json({ ok: true })
}
