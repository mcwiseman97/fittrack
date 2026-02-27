import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { routines, routineExercises, exercises } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { UpdateRoutineSchema } from "@/lib/validators"

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const [routine] = await db.select().from(routines).where(eq(routines.id, id))
  if (!routine) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const exs = await db
    .select({
      id: routineExercises.id,
      exerciseId: routineExercises.exerciseId,
      exerciseName: exercises.name,
      category: exercises.category,
      sortOrder: routineExercises.sortOrder,
      defaultSets: routineExercises.defaultSets,
      defaultRepsMin: routineExercises.defaultRepsMin,
      defaultRepsMax: routineExercises.defaultRepsMax,
      defaultWeightKg: routineExercises.defaultWeightKg,
      restSeconds: routineExercises.restSeconds,
      notes: routineExercises.notes,
    })
    .from(routineExercises)
    .innerJoin(exercises, eq(routineExercises.exerciseId, exercises.id))
    .where(eq(routineExercises.routineId, id))
    .orderBy(asc(routineExercises.sortOrder))

  return NextResponse.json({ ...routine, exercises: exs })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const body = await req.json()
  const parsed = UpdateRoutineSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const [updated] = await db
    .update(routines)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(routines.id, id))
    .returning()
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  await db.delete(routines).where(eq(routines.id, id))
  return NextResponse.json({ ok: true })
}
