import { round0, macroRatio } from "@/lib/utils"
import { MACRO_COLORS } from "@/lib/constants"
import type { DailySummary } from "@/types"

interface Props {
  summary: DailySummary
}

export function CalorieProgressBar({ summary }: Props) {
  const { calories, targetCalories, proteinG, carbsG, fatG } = summary

  const totalFromMacros = proteinG * 4 + carbsG * 4 + fatG * 9
  const ratio = macroRatio(calories, targetCalories)

  // Proportional macro segments
  const pRatio = totalFromMacros > 0 ? (proteinG * 4) / targetCalories : 0
  const cRatio = totalFromMacros > 0 ? (carbsG * 4) / targetCalories : 0
  const fRatio = totalFromMacros > 0 ? (fatG * 9) / targetCalories : 0

  const remaining = Math.max(targetCalories - round0(calories), 0)
  const over = calories > targetCalories

  return (
    <div className="bento-card space-y-3">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-semibold text-muted-foreground">Daily Calories</span>
        <div>
          <span className="text-2xl font-bold" style={{ color: over ? "#f87171" : MACRO_COLORS.calories }}>
            {round0(calories)}
          </span>
          <span className="text-sm text-muted-foreground"> / {targetCalories} kcal</span>
        </div>
      </div>

      {/* Stacked macro bar */}
      <div className="h-4 rounded-full overflow-hidden bg-secondary flex">
        {[
          { ratio: Math.min(pRatio, ratio), color: MACRO_COLORS.protein },
          { ratio: Math.min(cRatio, Math.max(ratio - pRatio, 0)), color: MACRO_COLORS.carbs },
          { ratio: Math.min(fRatio, Math.max(ratio - pRatio - cRatio, 0)), color: MACRO_COLORS.fat },
        ].map((seg, i) => (
          <div
            key={i}
            className="h-full transition-all duration-500"
            style={{ width: `${seg.ratio * 100}%`, background: seg.color }}
          />
        ))}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="flex gap-3">
          <span style={{ color: MACRO_COLORS.protein }}>P {round0(proteinG)}g</span>
          <span style={{ color: MACRO_COLORS.carbs }}>C {round0(carbsG)}g</span>
          <span style={{ color: MACRO_COLORS.fat }}>F {round0(fatG)}g</span>
        </span>
        <span className={over ? "text-neon-red" : "text-neon-green"}>
          {over ? `${round0(calories - targetCalories)} over` : `${remaining} left`}
        </span>
      </div>
    </div>
  )
}
