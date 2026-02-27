import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PageHeader } from "@/components/layout/PageHeader"
import { RoutineForm } from "@/components/workouts/RoutineForm"

export const metadata: Metadata = { title: "Edit Routine" }

async function getRoutine(id: string) {
  const res = await fetch(`http://localhost:${process.env.PORT ?? 3000}/api/routines/${id}`, { cache: "no-store" })
  if (!res.ok) return null
  return res.json()
}

export default async function EditRoutinePage({ params }: { params: { id: string } }) {
  const routine = await getRoutine(params.id)
  if (!routine) notFound()

  return (
    <div className="space-y-4">
      <PageHeader title="Edit Routine" description={routine.name} />
      <RoutineForm routine={routine} />
    </div>
  )
}
