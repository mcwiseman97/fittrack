import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { routineExercises, exercises } from "@/db/schema"
import { eq } from "drizzle-orm"
import { AddRoutineExerciseSchema } from "@/lib/validators"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const routineId = parseInt(params.id)
  const body = await req.json()
  const parsed = AddRoutineExerciseSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const [re] = await db
    .insert(routineExercises)
    .values({ ...parsed.data, routineId })
    .returning()
  return NextResponse.json(re, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url)
  const routineExId = parseInt(searchParams.get("routineExerciseId") ?? "0")
  await db.delete(routineExercises).where(eq(routineExercises.id, routineExId))
  return NextResponse.json({ ok: true })
}
