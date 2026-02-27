import { redirect } from "next/navigation"
import { todayStr } from "@/lib/utils"

export default function NutritionPage() {
  redirect(`/nutrition/${todayStr()}`)
}
