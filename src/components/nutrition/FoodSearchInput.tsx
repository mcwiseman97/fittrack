"use client"
import { useState, useEffect } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/useDebounce"
import type { Food } from "@/db/schema"

interface Props {
  onSelect: (food: Food) => void
}

export function FoodSearchInput({ onSelect }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Food[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery.length < 1) {
      setResults([])
      setOpen(false)
      return
    }

    setLoading(true)
    fetch(`/api/foods?q=${encodeURIComponent(debouncedQuery)}&limit=20`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data)
        setOpen(true)
      })
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  const handleSelect = (food: Food) => {
    onSelect(food)
    setQuery("")
    setResults([])
    setOpen(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search food database..."
          className="pl-9"
          onFocus={() => query.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-auto rounded-xl border border-border bg-card shadow-xl">
          {results.map((food) => (
            <li
              key={food.id}
              className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-accent transition-colors"
              onMouseDown={() => handleSelect(food)}
            >
              <div>
                <p className="text-sm font-medium">{food.name}</p>
                {food.brand && <p className="text-xs text-muted-foreground">{food.brand}</p>}
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{Math.round(food.calories)} kcal</p>
                <p>{food.servingSizeG}{food.servingUnit}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && results.length === 0 && !loading && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-border bg-card shadow-xl p-4 text-center text-sm text-muted-foreground">
          No results for &quot;{query}&quot;
        </div>
      )}
    </div>
  )
}
