"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Plus, Timer, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/PageHeader"
import { ActiveWorkoutPanel } from "@/components/workouts/ActiveWorkoutPanel"
import { ExerciseSelector } from "@/components/workouts/ExerciseSelector"
import { useActiveWorkout } from "@/hooks/useActiveWorkout"
import type { ActiveExercise } from "@/types"
import type { Exercise } from "@/db/schema"
import { formatDuration } from "@/lib/utils"

export default function ActiveWorkoutPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const workout = useActiveWorkout()
  const { state } = workout
  const [showExSelector, setShowExSelector] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [initialized, setInitialized] = useState(false)

  // Elapsed timer
  useEffect(() => {
    if (!state.sessionId) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - state.startedAt.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [state.sessionId, state.startedAt])

  // Initialize session from routine
  useEffect(() => {
    if (initialized) return
    setInitialized(true)

    fetch(`/api/routines/${id}`)
      .then((r) => r.json())
      .then(async (routine) => {
        const sessionRes = await fetch("/api/workouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ routineId: routine.id, name: routine.name }),
        })
        const session = await sessionRes.json()

        // Fetch logged exercises (pre-populated by the POST handler)
        const exRes = await fetch(`/api/workouts/${session.id}/exercises`)
        const loggedExs = await exRes.json()

        const activeExercises: ActiveExercise[] = loggedExs.map((le: { id: number; exerciseId: number; exerciseName: string }, idx: number) => {
          const routineEx = routine.exercises[idx]
          return {
            exerciseId: le.exerciseId,
            exerciseName: le.exerciseName,
            loggedExerciseId: le.id,
            restSeconds: routineEx?.restSeconds ?? 90,
            sets: Array.from({ length: routineEx?.defaultSets ?? 3 }, (_, i) => ({
              setNumber: i + 1,
              reps: routineEx?.defaultRepsMin ?? null,
              weightKg: routineEx?.defaultWeightKg ?? null,
              isWarmup: false,
              isDropSet: false,
              completed: false,
            })),
          }
        })

        workout.initSession(session.id, routine.id, routine.name, activeExercises)
      })
      .catch(() => toast.error("Failed to load routine"))
  }, [id, initialized])

  const addExercise = async (ex: Exercise) => {
    if (!state.sessionId) return
    const res = await fetch(`/api/workouts/${state.sessionId}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId: ex.id }),
    })
    if (res.ok) {
      const logged = await res.json()
      const newEx: ActiveExercise = {
        exerciseId: ex.id,
        exerciseName: ex.name,
        loggedExerciseId: logged.id,
        restSeconds: 90,
        sets: [{ setNumber: 1, reps: null, weightKg: null, isWarmup: false, isDropSet: false, completed: false }],
      }
      workout.dispatch({
        type: "INIT_SESSION",
        sessionId: state.sessionId,
        routineId: state.routineId,
        name: state.name,
        exercises: [...state.exercises, newEx],
      })
    }
  }

  const handleFinish = async () => {
    await workout.finishSession()
    toast.success("Workout completed! 💪", { duration: 3000 })
    router.push("/workouts")
  }

  if (!state.sessionId) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading workout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-4">
      <PageHeader
        title={state.name}
        description={formatDuration(elapsed)}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExSelector(true)}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Exercise
            </Button>
            <Button size="sm" onClick={handleFinish} className="gap-1.5 bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30">
              <CheckCircle2 className="w-4 h-4" />
              Finish
            </Button>
          </div>
        }
      />

      <ActiveWorkoutPanel workout={workout} />

      <ExerciseSelector
        open={showExSelector}
        onClose={() => setShowExSelector(false)}
        onSelect={(ex) => { addExercise(ex); setShowExSelector(false) }}
      />
    </div>
  )
}
