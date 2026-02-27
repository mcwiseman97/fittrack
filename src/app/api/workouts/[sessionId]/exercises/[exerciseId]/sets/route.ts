import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { sets, loggedExercises, workoutSessions } from "@/db/schema"
import { eq, and, desc, asc } from "drizzle-orm"
import { CreateSetSchema, UpdateSetSchema } from "@/lib/validators"

export async function GET(_: NextRequest, { params }: { params: { exerciseId: string } }) {
  const loggedExerciseId = parseInt(params.exerciseId)
  const allSets = await db
    .select()
    .from(sets)
    .where(eq(sets.loggedExerciseId, loggedExerciseId))
    .orderBy(asc(sets.setNumber))
  return NextResponse.json(allSets)
}

export async function POST(req: NextRequest, { params }: { params: { exerciseId: string } }) {
  const loggedExerciseId = parseInt(params.exerciseId)
  const body = await req.json()
  const parsed = CreateSetSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const setData = {
    ...parsed.data,
    loggedExerciseId,
    completedAt: parsed.data.completedAt ? new Date(parsed.data.completedAt) : new Date(),
  }

  const [newSet] = await db.insert(sets).values(setData).returning()
  return NextResponse.json(newSet, { status: 201 })
}

export async function PATCH(req: NextRequest, { params }: { params: { exerciseId: string } }) {
  const { searchParams } = new URL(req.url)
  const setId = parseInt(searchParams.get("setId") ?? "0")
  const body = await req.json()
  const parsed = UpdateSetSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { completedAt, ...rest } = parsed.data
  const updateData = {
    ...rest,
    ...(completedAt !== undefined ? { completedAt: new Date(completedAt) } : {}),
  }

  const [updated] = await db
    .update(sets)
    .set(updateData)
    .where(eq(sets.id, setId))
    .returning()
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest) {
  const url = new URL(_.url)
  const setId = parseInt(url.searchParams.get("setId") ?? "0")
  await db.delete(sets).where(eq(sets.id, setId))
  return NextResponse.json({ ok: true })
}
