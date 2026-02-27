"use client"
import { Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, kgToLbs, lbsToKg } from "@/lib/utils"
import type { ActiveSet } from "@/types"

interface Props {
  set: ActiveSet
  setIndex: number
  onUpdate: (field: keyof ActiveSet, value: number | boolean | null) => void
  onComplete: () => void
  onRemove: () => void
  previousWeight?: number | null
  previousReps?: number | null
}

export function SetRow({ set, setIndex, onUpdate, onComplete, onRemove, previousWeight, previousReps }: Props) {
  return (
    <div className={cn(
      "flex items-center gap-2 py-2 px-2 rounded-lg transition-all",
      set.completed ? "bg-neon-green/5 border border-neon-green/20" : "hover:bg-secondary/50",
      set.isWarmup ? "opacity-70" : ""
    )}>
      {/* Set number / type */}
      <button
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors border",
          set.isWarmup
            ? "border-yellow-500/40 text-yellow-500 bg-yellow-500/10"
            : "border-border text-muted-foreground hover:border-primary/50"
        )}
        onClick={() => onUpdate("isWarmup", !set.isWarmup)}
        title={set.isWarmup ? "Warmup set" : "Working set"}
      >
        {set.isWarmup ? "W" : set.setNumber}
      </button>

      {/* Previous performance hint */}
      <div className="w-14 text-center hidden sm:block">
        {previousWeight && previousReps ? (
          <p className="text-xs text-muted-foreground">{kgToLbs(previousWeight)}×{previousReps}</p>
        ) : (
          <p className="text-xs text-muted-foreground">—</p>
        )}
      </div>

      {/* Weight input */}
      <div className="flex-1">
        <Input
          type="number"
          step="2.5"
          min="0"
          value={set.weightKg != null ? kgToLbs(set.weightKg) : ""}
          onChange={(e) => onUpdate("weightKg", e.target.value ? lbsToKg(parseFloat(e.target.value)) : null)}
          placeholder="lbs"
          className="h-9 text-center text-sm"
          disabled={set.completed}
        />
      </div>

      {/* Reps input */}
      <div className="flex-1">
        <Input
          type="number"
          step="1"
          min="0"
          value={set.reps ?? ""}
          onChange={(e) => onUpdate("reps", e.target.value ? parseInt(e.target.value) : null)}
          placeholder="reps"
          className="h-9 text-center text-sm"
          disabled={set.completed}
        />
      </div>

      {/* Complete / remove */}
      {set.completed ? (
        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-neon-green/20">
          <Check className="w-4 h-4 text-neon-green" />
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon-sm"
          className="w-9 h-9 rounded-lg hover:bg-neon-green/20 hover:text-neon-green transition-colors shrink-0"
          onClick={onComplete}
          disabled={set.reps === null && set.weightKg === null}
        >
          <Check className="w-4 h-4" />
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon-sm"
        className="w-7 h-7 text-muted-foreground hover:text-destructive shrink-0"
        onClick={onRemove}
        disabled={set.completed}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  )
}
