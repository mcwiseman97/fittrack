"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GOAL_TYPES, ACTIVITY_LEVELS } from "@/lib/constants"
import { kgToLbs, lbsToKg, cmToFtInParts, ftInToCm } from "@/lib/utils"
import type { Profile } from "@/db/schema"

const schema = z.object({
  name: z.string().min(1),
  weightLbs: z.coerce.number().positive().optional().or(z.literal("")),
  heightFt: z.coerce.number().int().min(0).max(9).optional().or(z.literal("")),
  heightIn: z.coerce.number().min(0).max(11.9).optional().or(z.literal("")),
  ageYears: z.coerce.number().int().positive().optional().or(z.literal("")),
  biologicalSex: z.enum(["male", "female", "other", ""]).optional(),
  goalType: z.enum(["lose", "maintain", "gain", ""]).optional(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "veryActive", ""]).optional(),
})

type FormValues = z.infer<typeof schema>

export function ProfileForm({ profile }: { profile: Profile }) {
  const heightParts = profile.heightCm ? cmToFtInParts(profile.heightCm) : null

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile.name,
      weightLbs: profile.weightKg ? kgToLbs(profile.weightKg) : "",
      heightFt: heightParts?.ft ?? "",
      heightIn: heightParts?.inches ?? "",
      ageYears: profile.ageYears ?? "",
      biologicalSex: (profile.biologicalSex ?? "") as "",
      goalType: (profile.goalType ?? "") as "",
      activityLevel: (profile.activityLevel ?? "") as "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    const ft = data.heightFt === "" ? 0 : Number(data.heightFt)
    const inches = data.heightIn === "" ? 0 : Number(data.heightIn)
    const hasHeight = data.heightFt !== "" || data.heightIn !== ""

    const body = {
      name: data.name,
      weightKg: data.weightLbs === "" ? null : lbsToKg(Number(data.weightLbs)),
      heightCm: hasHeight ? ftInToCm(ft, inches) : null,
      ageYears: data.ageYears === "" ? null : Number(data.ageYears),
      biologicalSex: data.biologicalSex === "" ? null : data.biologicalSex,
      goalType: data.goalType === "" ? null : data.goalType,
      activityLevel: data.activityLevel === "" ? null : data.activityLevel,
    }
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (res.ok) toast.success("Profile updated")
    else toast.error("Failed to update profile")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input {...register("name")} placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <Label>Age</Label>
              <Input {...register("ageYears")} type="number" placeholder="30" />
            </div>
            <div className="space-y-1.5">
              <Label>Weight (lbs)</Label>
              <Input {...register("weightLbs")} type="number" step="0.5" placeholder="165" />
            </div>
            <div className="space-y-1.5">
              <Label>Height</Label>
              <div className="flex gap-2">
                <Input {...register("heightFt")} type="number" step="1" placeholder="ft" className="w-20" />
                <Input {...register("heightIn")} type="number" step="0.5" placeholder="in" className="w-20" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Biological Sex</Label>
              <Select
                value={watch("biologicalSex") ?? ""}
                onValueChange={(v) => setValue("biologicalSex", v as "")}
              >
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Goal</Label>
              <Select
                value={watch("goalType") ?? ""}
                onValueChange={(v) => setValue("goalType", v as "")}
              >
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {GOAL_TYPES.map((g) => (
                    <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Activity Level</Label>
            <Select
              value={watch("activityLevel") ?? ""}
              onValueChange={(v) => setValue("activityLevel", v as "")}
            >
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {ACTIVITY_LEVELS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label} — {a.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
