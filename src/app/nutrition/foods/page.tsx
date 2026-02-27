"use client"
import { useState, useEffect } from "react"
import { Search, Plus, Trash2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/layout/PageHeader"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CustomFoodForm } from "@/components/nutrition/CustomFoodForm"
import { useDebounce } from "@/hooks/useDebounce"
import type { Food } from "@/db/schema"
import { round0, round1 } from "@/lib/utils"

export default function FoodDatabasePage() {
  const [foods, setFoods] = useState<Food[]>([])
  const [query, setQuery] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const url = debouncedQuery
      ? `/api/foods?q=${encodeURIComponent(debouncedQuery)}&limit=100`
      : "/api/foods?limit=100"
    fetch(url).then((r) => r.json()).then(setFoods)
  }, [debouncedQuery])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    const res = await fetch(`/api/foods/${id}`, { method: "DELETE" })
    if (res.ok) {
      setFoods((prev) => prev.filter((f) => f.id !== id))
      toast.success("Food deleted")
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Food Database"
        description="Manage your custom food items"
        action={
          <Button size="sm" onClick={() => setShowAdd(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Food
          </Button>
        }
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods..."
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {foods.map((food) => (
          <div key={food.id} className="bento-card flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{food.name}</p>
              {food.brand && <p className="text-xs text-muted-foreground">{food.brand}</p>}
            </div>
            <div className="text-xs text-muted-foreground text-right shrink-0">
              <p>{food.servingSizeG}{food.servingUnit}</p>
              <p>{round0(food.calories)} kcal</p>
            </div>
            <div className="text-xs grid grid-cols-3 gap-2 text-center shrink-0 hidden sm:grid">
              <div><p className="text-[#a78bfa]">P</p><p>{round1(food.proteinG)}g</p></div>
              <div><p className="text-[#60a5fa]">C</p><p>{round1(food.carbsG)}g</p></div>
              <div><p className="text-[#fb923c]">F</p><p>{round1(food.fatG)}g</p></div>
            </div>
            {food.isCustom && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => handleDelete(food.id, food.name)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        ))}

        {foods.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No foods found</p>
            <p className="text-xs mt-1">Add custom foods to track your nutrition</p>
          </div>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Custom Food</DialogTitle></DialogHeader>
          <CustomFoodForm
            onCreated={(food) => {
              setFoods((prev) => [food, ...prev])
              setShowAdd(false)
            }}
            onCancel={() => setShowAdd(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
