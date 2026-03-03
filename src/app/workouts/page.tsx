"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/PageHeader"
import { RoutineCard } from "@/components/workouts/RoutineCard"
import { WorkoutHistoryCard } from "@/components/workouts/WorkoutHistoryCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RoutineWithExercises } from "@/types"
import type { WorkoutSession } from "@/db/schema"

export default function WorkoutsPage() {
  const [routines, setRoutines] = useState<RoutineWithExercises[]>([])
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/routines").then((r) => r.json()).catch(() => []),
      fetch("/api/workouts?limit=20").then((r) => r.json()).catch(() => []),
    ]).then(([r, s]) => {
      setRoutines(Array.isArray(r) ? r : [])
      setSessions(Array.isArray(s) ? s : [])
      setLoading(false)
    })
  }, [])

  const handleDeleteRoutine = (id: number) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Workouts"
        action={
          <div className="flex gap-2">
            <Link href="/workouts/new/log">
              <Button variant="outline" size="sm" className="gap-2">
                <Zap className="w-4 h-4" />
                Quick Workout
              </Button>
            </Link>
            <Link href="/workouts/routines/new">
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Routine
              </Button>
            </Link>
          </div>
        }
      />

      <Tabs defaultValue="routines">
        <TabsList className="w-full">
          <TabsTrigger value="routines" className="flex-1">Routines</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
        </TabsList>

        <TabsContent value="routines" className="mt-4 space-y-3">
          {loading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
          ) : routines.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-muted-foreground text-sm">No routines yet</p>
              <Link href="/workouts/routines/new">
                <Button variant="outline" size="sm">Create your first routine</Button>
              </Link>
            </div>
          ) : (
            routines.map((r) => (
              <RoutineCard key={r.id} routine={r} onDelete={handleDeleteRoutine} />
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          {loading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No workouts logged yet</p>
            </div>
          ) : (
            sessions.map((s) => (
              <WorkoutHistoryCard key={s.id} session={s} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
