import Link from "next/link"
import { Play, CheckCircle2, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/db"
import { workoutSessions } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { todayStr, formatDuration } from "@/lib/utils"

async function getTodayWorkout() {
  const today = todayStr()
  const sessions = await db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.dateStr, today))
    .orderBy(desc(workoutSessions.startedAt))
    .limit(1)
  return sessions[0] ?? null
}

export async function TodayWorkoutWidget() {
  const session = await getTodayWorkout()

  if (!session) {
    return (
      <div className="bento-card flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-muted-foreground">Today&apos;s Workout</p>
        </div>
        <p className="text-sm text-foreground">No workout logged yet</p>
        <Link href="/workouts">
          <Button size="sm" variant="outline" className="gap-1.5 w-full">
            <Play className="w-3.5 h-3.5" />
            Start a workout
          </Button>
        </Link>
      </div>
    )
  }

  const done = !!session.finishedAt

  return (
    <div className={`bento-card flex flex-col gap-3 ${done ? "border-neon-green/20" : "border-neon-orange/20"}`}>
      <div className="flex items-center gap-2">
        {done ? (
          <CheckCircle2 className="w-4 h-4 text-neon-green" />
        ) : (
          <Dumbbell className="w-4 h-4 text-neon-orange animate-pulse" />
        )}
        <p className="text-sm font-semibold text-muted-foreground">Today&apos;s Workout</p>
      </div>
      <div>
        <p className="font-bold">{session.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {done
            ? `Completed · ${session.durationSec ? formatDuration(session.durationSec) : ""}`
            : "In progress"}
        </p>
      </div>
      <Link href={`/workouts/history/${session.id}`}>
        <Button size="sm" variant="ghost" className="w-full text-xs">
          View session →
        </Button>
      </Link>
    </div>
  )
}
