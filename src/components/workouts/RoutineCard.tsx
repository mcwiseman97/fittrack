"use client"
import Link from "next/link"
import { Play, Pencil, Trash2, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import type { RoutineWithExercises } from "@/types"

interface Props {
  routine: RoutineWithExercises
  onDelete: (id: number) => void
}

export function RoutineCard({ routine, onDelete }: Props) {
  const handleDelete = async () => {
    if (!confirm(`Delete "${routine.name}"?`)) return
    const res = await fetch(`/api/routines/${routine.id}`, { method: "DELETE" })
    if (res.ok) {
      onDelete(routine.id)
      toast.success("Routine deleted")
    }
  }

  return (
    <Card className="group overflow-hidden">
      <div className="h-1 w-full" style={{ background: routine.color }} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate">{routine.name}</p>
            {routine.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{routine.description}</p>
            )}
            <div className="flex items-center gap-1.5 mt-2">
              <Dumbbell className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {routine.exercises.length} exercise{routine.exercises.length !== 1 ? "s" : ""}
              </p>
            </div>
            {routine.exercises.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {routine.exercises.slice(0, 3).map((e) => e.exerciseName).join(", ")}
                {routine.exercises.length > 3 && ` +${routine.exercises.length - 3} more`}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5 shrink-0">
            <Link href={`/workouts/routines/${routine.id}/log`}>
              <Button size="sm" className="h-8 gap-1.5 text-xs w-full">
                <Play className="w-3 h-3" />
                Start
              </Button>
            </Link>
            <div className="flex gap-1">
              <Link href={`/workouts/routines/${routine.id}`}>
                <Button variant="ghost" size="icon-sm">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
