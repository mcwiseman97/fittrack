"use client"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EXERCISE_CATEGORIES } from "@/lib/constants"
import { useDebounce } from "@/hooks/useDebounce"
import type { Exercise } from "@/db/schema"

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (exercise: Exercise) => void
}

export function ExerciseSelector({ open, onClose, onSelect }: Props) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const debouncedQuery = useDebounce(query, 200)

  useEffect(() => {
    if (!open) return
    const params = new URLSearchParams({ limit: "200" })
    fetch(`/api/exercises?${params}`)
      .then((r) => r.json())
      .then(setExercises)
  }, [open])

  const filtered = exercises.filter((ex) => {
    const matchesQuery = debouncedQuery
      ? ex.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      : true
    const matchesCat = category ? ex.category === category : true
    return matchesQuery && matchesCat
  })

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Exercise</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises..."
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${!category ? "bg-primary/20 border-primary/30 text-primary" : "border-border text-muted-foreground hover:border-border/80"}`}
            onClick={() => setCategory(null)}
          >
            All
          </button>
          {EXERCISE_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${category === cat.value ? "border-border text-foreground bg-secondary" : "border-border/50 text-muted-foreground hover:text-foreground"}`}
              onClick={() => setCategory(cat.value === category ? null : cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 -mx-1 space-y-0.5">
          {filtered.map((ex) => (
            <button
              key={ex.id}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent transition-colors"
              onClick={() => { onSelect(ex); onClose(); setQuery("") }}
            >
              <p className="text-sm font-medium">{ex.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {ex.category}{ex.equipment ? ` · ${ex.equipment}` : ""}
                {ex.muscleGroup ? ` · ${ex.muscleGroup}` : ""}
              </p>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No exercises found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
