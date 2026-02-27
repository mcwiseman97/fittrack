import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { profile } from "@/db/schema"
import { eq } from "drizzle-orm"
import { UpdateProfileSchema } from "@/lib/validators"

export async function GET() {
  const [row] = await db.select().from(profile).where(eq(profile.id, 1))
  if (!row) {
    // Ensure profile row exists
    const [created] = await db.insert(profile).values({ id: 1 }).returning()
    return NextResponse.json(created)
  }
  return NextResponse.json(row)
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const parsed = UpdateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const [updated] = await db
    .update(profile)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(profile.id, 1))
    .returning()

  return NextResponse.json(updated)
}
