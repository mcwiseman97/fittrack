import type { Metadata } from "next"
import { db } from "@/db"
import { profile } from "@/db/schema"
import { eq } from "drizzle-orm"
import { PageHeader } from "@/components/layout/PageHeader"
import { ProfileForm } from "@/components/settings/ProfileForm"
import { MacroTargetsForm } from "@/components/settings/MacroTargetsForm"
import { ExportImportPanel } from "@/components/settings/ExportImportPanel"

export const metadata: Metadata = { title: "Settings" }

async function getProfile() {
  const [row] = await db.select().from(profile).where(eq(profile.id, 1))
  if (!row) {
    const [created] = await db.insert(profile).values({ id: 1 }).returning()
    return created
  }
  return row
}

export default async function SettingsPage() {
  const userProfile = await getProfile()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile, targets, and data"
      />
      <ProfileForm profile={userProfile} />
      <MacroTargetsForm profile={userProfile} />
      <ExportImportPanel />
    </div>
  )
}
