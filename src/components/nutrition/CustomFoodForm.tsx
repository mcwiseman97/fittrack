"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Food } from "@/db/schema"

const schema = z.object({
  name: z.string().min(1),
  brand: z.string().optional(),
  servingSizeG: z.coerce.number().positive(),
  calories: z.coerce.number().min(0),
  proteinG: z.coerce.number().min(0),
  carbsG: z.coerce.number().min(0),
  fatG: z.coerce.number().min(0),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onCreated: (food: Food) => void
  onCancel: () => void
}

export function CustomFoodForm({ onCreated, onCancel }: Props) {
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { servingSizeG: 100, calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  })

  const onSubmit = async (data: FormValues) => {
    const res = await fetch("/api/foods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const food = await res.json()
      onCreated(food)
      toast.success(`Added ${food.name} to database`)
    } else {
      toast.error("Failed to create food")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label>Food name *</Label>
          <Input {...register("name")} placeholder="e.g. Chicken Breast" />
        </div>
        <div className="space-y-1">
          <Label>Brand (optional)</Label>
          <Input {...register("brand")} placeholder="e.g. Tyson" />
        </div>
        <div className="space-y-1">
          <Label>Serving size (g)</Label>
          <Input {...register("servingSizeG")} type="number" step="1" />
        </div>
        <div className="space-y-1">
          <Label className="text-neon-green">Calories (kcal)</Label>
          <Input {...register("calories")} type="number" step="0.1" />
        </div>
        <div className="space-y-1">
          <Label className="text-neon-purple">Protein (g)</Label>
          <Input {...register("proteinG")} type="number" step="0.1" />
        </div>
        <div className="space-y-1">
          <Label className="text-neon-blue">Carbs (g)</Label>
          <Input {...register("carbsG")} type="number" step="0.1" />
        </div>
        <div className="space-y-1">
          <Label className="text-neon-orange">Fat (g)</Label>
          <Input {...register("fatG")} type="number" step="0.1" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" size="sm" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Saving..." : "Save Food"}
        </Button>
      </div>
    </form>
  )
}
