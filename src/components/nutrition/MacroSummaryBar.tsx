"use client"
import { round0, round1, pctStr, macroRatio } from "@/lib/utils"
import { MACRO_COLORS } from "@/lib/constants"
import type { DailySummary } from "@/types"

interface Props {
  summary: DailySummary
}

export function MacroSummaryBar({ summary }: Props) {
  const { calories, targetCalories, proteinG, targetProteinG, carbsG, targetCarbsG, fatG, targetFatG } = summary

  const calorieRatio = macroRatio(calories, targetCalories)
  const proteinRatio = macroRatio(proteinG, targetProteinG)
  const carbsRatio = macroRatio(carbsG, targetCarbsG)
  const fatRatio = macroRatio(fatG, targetFatG)

  const macros = [
    { label: "Protein", value: round1(proteinG), target: targetProteinG, ratio: proteinRatio, color: MACRO_COLORS.protein, unit: "g" },
    { label: "Carbs", value: round1(carbsG), target: targetCarbsG, ratio: carbsRatio, color: MACRO_COLORS.carbs, unit: "g" },
    { label: "Fat", value: round1(fatG), target: targetFatG, ratio: fatRatio, color: MACRO_COLORS.fat, unit: "g" },
  ]

  return (
    <div className="bento-card space-y-4">
      {/* Calorie summary */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Calories</span>
          <div className="text-right">
            <span className="text-xl font-bold" style={{ color: MACRO_COLORS.calories }}>
              {round0(calories)}
            </span>
            <span className="text-sm text-muted-foreground"> / {targetCalories} kcal</span>
          </div>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(calorieRatio * 100, 100)}%`,
              background: calories > targetCalories
                ? MACRO_COLORS.calories + "80"
                : MACRO_COLORS.calories,
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {targetCalories - round0(calories) > 0
            ? `${targetCalories - round0(calories)} kcal remaining`
            : `${round0(calories) - targetCalories} kcal over`}
        </p>
      </div>

      {/* Macro bars */}
      <div className="grid grid-cols-3 gap-3">
        {macros.map((macro) => (
          <div key={macro.label}>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: macro.color }}>{macro.label}</span>
              <span className="text-xs text-muted-foreground">{pctStr(macro.ratio)}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(macro.ratio * 100, 100)}%`,
                  background: macro.color,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {macro.value}{macro.unit} / {macro.target}{macro.unit}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
