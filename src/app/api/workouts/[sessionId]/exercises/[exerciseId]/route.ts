import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { loggedExercises } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function PATCH(req: NextRequest, { params }: { params: { exerciseId: string } }) {
  const id = parseInt(params.exerciseId)
  const body = await req.json()
  const [updated] = await db
    .update(loggedExercises)
    .set(body)
    .where(eq(loggedExercises.id, id))
    .returning()
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { exerciseId: string } }) {
  const id = parseInt(params.exerciseId)
  await db.delete(loggedExercises).where(eq(loggedExercises.id, id))
  return NextResponse.json({ ok: true })
}
