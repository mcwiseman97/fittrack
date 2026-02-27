import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { workoutSessions, loggedExercises, sets } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { UpdateSessionSchema } from "@/lib/validators"

export async function GET(_: NextRequest, { params }: { params: { sessionId: string } }) {
  const id = parseInt(params.sessionId)
  const [session] = await db.select().from(workoutSessions).where(eq(workoutSessions.id, id))
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const exs = await db
    .select()
    .from(loggedExercises)
    .where(eq(loggedExercises.sessionId, id))
    .orderBy(asc(loggedExercises.sortOrder))

  const exercisesWithSets = await Promise.all(
    exs.map(async (ex) => {
      const exSets = await db
        .select()
        .from(sets)
        .where(eq(sets.loggedExerciseId, ex.id))
        .orderBy(asc(sets.setNumber))
      return { ...ex, sets: exSets }
    })
  )

  return NextResponse.json({ ...session, exercises: exercisesWithSets })
}

export async function PATCH(req: NextRequest, { params }: { params: { sessionId: string } }) {
  const id = parseInt(params.sessionId)
  const body = await req.json()
  const parsed = UpdateSessionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updateData: Record<string, unknown> = { ...parsed.data }
  if (parsed.data.finishedAt) updateData.finishedAt = new Date(parsed.data.finishedAt)

  const [updated] = await db
    .update(workoutSessions)
    .set(updateData)
    .where(eq(workoutSessions.id, id))
    .returning()
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { sessionId: string } }) {
  const id = parseInt(params.sessionId)
  await db.delete(workoutSessions).where(eq(workoutSessions.id, id))
  return NextResponse.json({ ok: true })
}
