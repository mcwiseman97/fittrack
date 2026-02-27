"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ExerciseSelector } from "./ExerciseSelector"
import { ROUTINE_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Exercise } from "@/db/schema"
import type { RoutineWithExercises } from "@/types"

interface RoutineExerciseSlot {
  exerciseId: number
  exerciseName: string
  category: string
  defaultSets: number
  defaultRepsMin: number
  defaultRepsMax: number
  defaultWeightKg: number | null
  restSeconds: number
  routineExerciseId?: number
}

interface Props {
  routine?: RoutineWithExercises
}

export function RoutineForm({ routine }: Props) {
  const router = useRouter()
  const [name, setName] = useState(routine?.name ?? "")
  const [description, setDescription] = useState(routine?.description ?? "")
  const [color, setColor] = useState(routine?.color ?? ROUTINE_COLORS[0])
  const [exercises, setExercises] = useState<RoutineExerciseSlot[]>(
    routine?.exercises.map((e) => ({
      exerciseId: e.exerciseId,
      exerciseName: e.exerciseName,
      category: e.category,
      defaultSets: e.defaultSets,
      defaultRepsMin: e.defaultRepsMin,
      defaultRepsMax: e.defaultRepsMax,
      defaultWeightKg: e.defaultWeightKg,
      restSeconds: e.restSeconds,
      routineExerciseId: e.id,
    })) ?? []
  )
  const [showSelector, setShowSelector] = useState(false)
  const [saving, setSaving] = useState(false)

  const addExercise = (ex: Exercise) => {
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        category: ex.category,
        defaultSets: 3,
        defaultRepsMin: 8,
        defaultRepsMax: 12,
        defaultWeightKg: null,
        restSeconds: 90,
      },
    ])
  }

  const removeExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateExercise = (idx: number, field: keyof RoutineExerciseSlot, value: unknown) => {
    setExercises((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)))
  }

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Routine name required"); return }
    setSaving(true)

    const isEdit = !!routine?.id

    const url = isEdit ? `/api/routines/${routine!.id}` : "/api/routines"
    const method = isEdit ? "PATCH" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description || null, color }),
    })

    if (!res.ok) { toast.error("Failed to save routine"); setSaving(false); return }

    const savedRoutine = await res.json()
    const routineId = savedRoutine.id

    // Save exercises (delete all + re-insert for simplicity)
    if (isEdit) {
      // Remove all existing
      for (const ex of routine!.exercises) {
        await fetch(`/api/routines/${routineId}/exercises?routineExerciseId=${ex.id}`, { method: "DELETE" })
      }
    }

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i]
      await fetch(`/api/routines/${routineId}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: ex.exerciseId,
          sortOrder: i,
          defaultSets: ex.defaultSets,
          defaultRepsMin: ex.defaultRepsMin,
          defaultRepsMax: ex.defaultRepsMax,
          defaultWeightKg: ex.defaultWeightKg,
          restSeconds: ex.restSeconds,
        }),
      })
    }

    toast.success(isEdit ? "Routine updated" : "Routine created")
    router.push("/workouts")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="bento-card space-y-4">
        <div className="space-y-1.5">
          <Label>Routine Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Push Day" />
        </div>
        <div className="space-y-1.5">
          <Label>Description (optional)</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Chest, Shoulders, Triceps"
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Color</Label>
          <div className="flex gap-2">
            {ROUTINE_COLORS.map((c) => (
              <button
                key={c}
                className={cn(
                  "w-7 h-7 rounded-full transition-transform",
                  color === c && "ring-2 ring-white ring-offset-2 ring-offset-background scale-110"
                )}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-base">Exercises ({exercises.length})</Label>
          <Button size="sm" variant="outline" onClick={() => setShowSelector(true)} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add Exercise
          </Button>
        </div>

        {exercises.map((ex, idx) => (
          <div key={idx} className="bento-card space-y-3">
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">{ex.exerciseName}</p>
                <p className="text-xs text-muted-foreground capitalize">{ex.category}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => removeExercise(idx)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Sets", field: "defaultSets" as const, step: "1" },
                { label: "Min reps", field: "defaultRepsMin" as const, step: "1" },
                { label: "Max reps", field: "defaultRepsMax" as const, step: "1" },
                { label: "Rest (s)", field: "restSeconds" as const, step: "15" },
              ].map(({ label, field, step }) => (
                <div key={field} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input
                    type="number"
                    step={step}
                    value={(ex[field] as number) ?? ""}
                    onChange={(e) => updateExercise(idx, field, parseInt(e.target.value) || 0)}
                    className="h-8 text-sm text-center"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {exercises.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm bento-card">
            No exercises yet — click &quot;Add Exercise&quot;
          </div>
        )}
      </div>

      <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
        {saving ? "Saving..." : routine ? "Update Routine" : "Create Routine"}
      </Button>

      <ExerciseSelector open={showSelector} onClose={() => setShowSelector(false)} onSelect={addExercise} />
    </div>
  )
}
