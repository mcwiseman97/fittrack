"use client"
import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FoodSearchInput } from "./FoodSearchInput"
import { CustomFoodForm } from "./CustomFoodForm"
import type { Food, FoodLogEntry } from "@/db/schema"
import type { MealType } from "@/types"
import { round1 } from "@/lib/utils"
import { toast } from "sonner"

interface Props {
  dateStr: string
  mealType: MealType
  onAdd: (entry: FoodLogEntry) => void
}

export function AddFoodDialog({ dateStr, mealType, onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [servings, setServings] = useState("1")
  const [adding, setAdding] = useState(false)

  const handleFoodSelect = (food: Food) => {
    setSelectedFood(food)
    setServings("1")
  }

  const handleAdd = async () => {
    if (!selectedFood) return
    const servingsNum = parseFloat(servings) || 1
    setAdding(true)

    const ratio = servingsNum
    const body = {
      dateStr,
      mealType,
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      servings: servingsNum,
      servingSizeG: selectedFood.servingSizeG,
      calories: round1(selectedFood.calories * ratio),
      proteinG: round1(selectedFood.proteinG * ratio),
      carbsG: round1(selectedFood.carbsG * ratio),
      fatG: round1(selectedFood.fatG * ratio),
      fiberG: selectedFood.fiberG ? round1(selectedFood.fiberG * ratio) : null,
    }

    const res = await fetch("/api/nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const entry = await res.json()
      onAdd(entry)
      toast.success(`Added ${selectedFood.name}`)
      setOpen(false)
      setSelectedFood(null)
      setServings("1")
    } else {
      toast.error("Failed to add food")
    }
    setAdding(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-1.5 text-xs h-8">
          <Plus className="w-3.5 h-3.5" />
          Add food
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Food</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="search">
          <TabsList className="w-full">
            <TabsTrigger value="search" className="flex-1">Search</TabsTrigger>
            <TabsTrigger value="custom" className="flex-1">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4 mt-4">
            <FoodSearchInput onSelect={handleFoodSelect} />

            {selectedFood && (
              <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3">
                <div>
                  <p className="font-semibold">{selectedFood.name}</p>
                  {selectedFood.brand && <p className="text-xs text-muted-foreground">{selectedFood.brand}</p>}
                </div>

                <div className="flex items-center gap-3">
                  <Label className="shrink-0">Servings</Label>
                  <Input
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    step="0.25"
                    min="0.25"
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">
                    × {selectedFood.servingSizeG}{selectedFood.servingUnit}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { label: "Cal", value: round1(selectedFood.calories * (parseFloat(servings) || 1)), color: "#34d399" },
                    { label: "P", value: round1(selectedFood.proteinG * (parseFloat(servings) || 1)) + "g", color: "#a78bfa" },
                    { label: "C", value: round1(selectedFood.carbsG * (parseFloat(servings) || 1)) + "g", color: "#60a5fa" },
                    { label: "F", value: round1(selectedFood.fatG * (parseFloat(servings) || 1)) + "g", color: "#fb923c" },
                  ].map((m) => (
                    <div key={m.label} className="text-center rounded-lg bg-secondary p-1.5">
                      <p style={{ color: m.color }} className="font-semibold">{m.value}</p>
                      <p className="text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>

                <Button onClick={handleAdd} disabled={adding} className="w-full">
                  {adding ? "Adding..." : "Add to log"}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom" className="mt-4">
            <CustomFoodForm
              onCreated={(food) => {
                handleFoodSelect(food)
              }}
              onCancel={() => setOpen(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
