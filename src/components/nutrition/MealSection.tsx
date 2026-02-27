"use client"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { FoodEntryRow } from "./FoodEntryRow"
import { AddFoodDialog } from "./AddFoodDialog"
import { round0, round1 } from "@/lib/utils"
import { MEAL_TYPES } from "@/lib/constants"
import type { FoodLogEntry } from "@/db/schema"
import type { MealType } from "@/types"

interface Props {
  mealType: MealType
  entries: FoodLogEntry[]
  dateStr: string
  onAdd: (entry: FoodLogEntry) => void
  onDelete: (id: number) => void
}

export function MealSection({ mealType, entries, dateStr, onAdd, onDelete }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const meta = MEAL_TYPES.find((m) => m.value === mealType)!

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      proteinG: acc.proteinG + e.proteinG,
    }),
    { calories: 0, proteinG: 0 }
  )

  return (
    <div className="bento-card">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.emoji}</span>
          <div>
            <p className="font-semibold text-sm">{meta.label}</p>
            {entries.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {round0(totals.calories)} kcal · P {round1(totals.proteinG)}g
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AddFoodDialog dateStr={dateStr} mealType={mealType} onAdd={onAdd} />
          {collapsed ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="mt-3">
          {entries.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No foods logged — tap &quot;Add food&quot; to get started
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {entries.map((entry) => (
                <FoodEntryRow key={entry.id} entry={entry} onDelete={onDelete} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
