import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/PageHeader"
import { RoutineForm } from "@/components/workouts/RoutineForm"

export const metadata: Metadata = { title: "New Routine" }

export default function NewRoutinePage() {
  return (
    <div className="space-y-4">
      <PageHeader title="New Routine" description="Create a workout template" />
      <RoutineForm />
    </div>
  )
}
