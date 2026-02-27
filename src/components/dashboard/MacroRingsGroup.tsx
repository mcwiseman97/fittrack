import { MacroRing } from "./MacroRing"
import { MACRO_COLORS } from "@/lib/constants"
import type { DailySummary } from "@/types"

interface Props {
  summary: DailySummary
}

export function MacroRingsGroup({ summary }: Props) {
  const { calories, targetCalories, proteinG, targetProteinG, carbsG, targetCarbsG, fatG, targetFatG } = summary

  return (
    <div className="bento-card">
      <p className="text-sm font-semibold text-muted-foreground mb-4">Today&apos;s Macros</p>
      <div className="flex items-center justify-around">
        {/* Big calorie ring */}
        <MacroRing
          label="Calories"
          value={Math.round(calories)}
          target={targetCalories}
          unit="kcal"
          color={MACRO_COLORS.calories}
          size={120}
          strokeWidth={10}
        />
        {/* Macro trio */}
        <div className="flex flex-col gap-4">
          <MacroRing
            label="Protein"
            value={Math.round(proteinG)}
            target={Math.round(targetProteinG)}
            unit="g"
            color={MACRO_COLORS.protein}
            size={76}
            strokeWidth={7}
          />
        </div>
        <div className="flex flex-col gap-4">
          <MacroRing
            label="Carbs"
            value={Math.round(carbsG)}
            target={Math.round(targetCarbsG)}
            unit="g"
            color={MACRO_COLORS.carbs}
            size={76}
            strokeWidth={7}
          />
        </div>
        <div className="flex flex-col gap-4">
          <MacroRing
            label="Fat"
            value={Math.round(fatG)}
            target={Math.round(targetFatG)}
            unit="g"
            color={MACRO_COLORS.fat}
            size={76}
            strokeWidth={7}
          />
        </div>
      </div>
    </div>
  )
}
