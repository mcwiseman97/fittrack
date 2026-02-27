"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MACRO_COLORS } from "@/lib/constants"
import type { Profile } from "@/db/schema"

const schema = z.object({
  targetCalories: z.coerce.number().int().positive().max(10000),
  targetProteinG: z.coerce.number().positive().max(1000),
  targetCarbsG: z.coerce.number().positive().max(2000),
  targetFatG: z.coerce.number().positive().max(1000),
})

type FormValues = z.infer<typeof schema>

const MACRO_FIELDS = [
  { name: "targetCalories" as const, label: "Daily Calories", unit: "kcal", color: MACRO_COLORS.calories },
  { name: "targetProteinG" as const, label: "Protein", unit: "g", color: MACRO_COLORS.protein },
  { name: "targetCarbsG" as const, label: "Carbohydrates", unit: "g", color: MACRO_COLORS.carbs },
  { name: "targetFatG" as const, label: "Fat", unit: "g", color: MACRO_COLORS.fat },
]

export function MacroTargetsForm({ profile }: { profile: Profile }) {
  const { register, handleSubmit, watch, formState: { isSubmitting, errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      targetCalories: profile.targetCalories,
      targetProteinG: profile.targetProteinG,
      targetCarbsG: profile.targetCarbsG,
      targetFatG: profile.targetFatG,
    },
  })

  const values = watch()
  const macroCalories =
    (Number(values.targetProteinG) || 0) * 4 +
    (Number(values.targetCarbsG) || 0) * 4 +
    (Number(values.targetFatG) || 0) * 9

  const onSubmit = async (data: FormValues) => {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) toast.success("Macro targets updated")
    else toast.error("Failed to update targets")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Targets</CardTitle>
        <CardDescription>Set your daily calorie and macro goals</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {MACRO_FIELDS.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: field.color }} />
                  {field.label}
                  <span className="text-muted-foreground font-normal">({field.unit})</span>
                </Label>
                <Input
                  {...register(field.name)}
                  type="number"
                  step={field.unit === "kcal" ? "1" : "0.1"}
                  className={errors[field.name] ? "border-destructive" : ""}
                />
              </div>
            ))}
          </div>

          {/* Macro-calorie cross-check */}
          <div className="rounded-lg bg-secondary p-3 text-sm">
            <span className="text-muted-foreground">From macros: </span>
            <span className={Math.abs(macroCalories - (Number(values.targetCalories) || 0)) > 100 ? "text-neon-orange" : "text-neon-green"}>
              {Math.round(macroCalories)} kcal
            </span>
            <span className="text-muted-foreground"> · Target: {values.targetCalories} kcal</span>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? "Saving..." : "Save Targets"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
