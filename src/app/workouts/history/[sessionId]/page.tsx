"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, Calendar, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateStr, formatDuration, round1, kgToLbs } from "@/lib/utils"
import type { SessionWithDetails } from "@/types"

export default function SessionDetailPage({ params }: { params: { sessionId: string } }) {
  const { sessionId } = params
  const router = useRouter()
  const [session, setSession] = useState<SessionWithDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/workouts/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        setSession(data)
        setLoading(false)
      })
  }, [sessionId])

  const handleDelete = async () => {
    if (!confirm("Delete this workout session?")) return
    const res = await fetch(`/api/workouts/${sessionId}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Session deleted")
      router.push("/workouts")
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!session) return <p className="text-muted-foreground">Session not found</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="font-bold text-xl">{session.name}</h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDateStr(session.dateStr)}
            </span>
            {session.durationSec && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(session.durationSec)}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {session.notes && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{session.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {session.exercises?.map((ex, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <p className="font-semibold text-sm mb-3">{ex.exerciseName}</p>
              <div className="space-y-1.5">
                {ex.sets?.map((set, setIdx) => (
                  <div key={setIdx} className="flex items-center gap-3 text-sm">
                    <span className={`w-6 text-center text-xs font-bold ${set.isWarmup ? "text-yellow-500" : "text-muted-foreground"}`}>
                      {set.isWarmup ? "W" : setIdx + 1}
                    </span>
                    <span className="flex-1">
                      {set.weightKg != null ? `${kgToLbs(set.weightKg)} lbs` : "BW"}
                      {" × "}
                      {set.reps != null ? `${set.reps} reps` : "—"}
                    </span>
                    {set.weightKg != null && set.reps != null && (
                      <span className="text-xs text-muted-foreground">
                        {round1(kgToLbs(set.weightKg) * set.reps)} vol
                      </span>
                    )}
                    {set.isPersonalBest && (
                      <span className="text-xs text-neon-yellow font-bold">🏆 PB</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
