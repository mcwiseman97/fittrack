"use client"
import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import type { ExerciseHistoryPoint } from "@/types"
import { format, parseISO } from "date-fns"
import { kgToLbs } from "@/lib/utils"

interface Props {
  exerciseName: string
}

export function ExerciseHistoryChart({ exerciseName }: Props) {
  const [data, setData] = useState<ExerciseHistoryPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/workouts/history/${encodeURIComponent(exerciseName)}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
  }, [exerciseName])

  if (loading) return <Skeleton className="h-32 w-full" />

  if (data.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-4">
        No history — complete a set to start tracking
      </p>
    )
  }

  const chartData = data.map((d) => ({
    date: format(parseISO(d.date), "MMM d"),
    weight: d.maxWeightKg != null ? kgToLbs(d.maxWeightKg) : null,
    volume: d.totalVolume,
  }))

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium">Max weight (lbs)</p>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#a78bfa"
            strokeWidth={2}
            dot={{ fill: "#a78bfa", r: 3 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
