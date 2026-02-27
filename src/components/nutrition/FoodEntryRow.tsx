"use client"
import { useState } from "react"
import { toast } from "sonner"
import { Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { round0, round1 } from "@/lib/utils"
import type { FoodLogEntry } from "@/db/schema"

interface Props {
  entry: FoodLogEntry
  onDelete: (id: number) => void
}

export function FoodEntryRow({ entry, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false)

  const handleDelete = async () => {
    const res = await fetch(`/api/nutrition/${entry.id}`, { method: "DELETE" })
    if (res.ok) {
      onDelete(entry.id)
      toast.success(`Removed ${entry.foodName}`)
    } else {
      toast.error("Failed to remove entry")
    }
  }

  return (
    <div className="group">
      <div
        className="flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{entry.foodName}</p>
          <p className="text-xs text-muted-foreground">
            {entry.servings !== 1 ? `${entry.servings}×` : ""}{entry.servingSizeG}g
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-neon-green">{round0(entry.calories)} kcal</p>
          <p className="text-xs text-muted-foreground">P {round1(entry.proteinG)}g</p>
        </div>
        <div className="flex items-center gap-1">
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          <Button
            variant="ghost"
            size="icon-sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); handleDelete() }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="ml-1 mb-2 px-3 py-2 rounded-lg bg-secondary/40 grid grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <p className="text-muted-foreground">Calories</p>
            <p className="font-semibold text-neon-green">{round0(entry.calories)}</p>
          </div>
          <div className="text-center">
            <p style={{ color: "#a78bfa" }}>Protein</p>
            <p className="font-semibold">{round1(entry.proteinG)}g</p>
          </div>
          <div className="text-center">
            <p style={{ color: "#60a5fa" }}>Carbs</p>
            <p className="font-semibold">{round1(entry.carbsG)}g</p>
          </div>
          <div className="text-center">
            <p style={{ color: "#fb923c" }}>Fat</p>
            <p className="font-semibold">{round1(entry.fatG)}g</p>
          </div>
        </div>
      )}
    </div>
  )
}
