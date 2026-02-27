import Link from "next/link"
import { Clock, Dumbbell, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatDateStr, formatDuration } from "@/lib/utils"
import type { WorkoutSession } from "@/db/schema"

interface Props {
  session: WorkoutSession
  exerciseCount?: number
}

export function WorkoutHistoryCard({ session, exerciseCount }: Props) {
  return (
    <Link href={`/workouts/history/${session.id}`}>
      <Card className="hover:border-border/70 transition-colors cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm group-hover:text-primary transition-colors">{session.name}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
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
                {exerciseCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <Dumbbell className="w-3 h-3" />
                    {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {session.notes && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{session.notes}</p>
              )}
            </div>
            <div className="text-xs text-right shrink-0 text-muted-foreground">
              <span className={session.finishedAt ? "text-neon-green" : "text-neon-orange"}>
                {session.finishedAt ? "Completed" : "In progress"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
