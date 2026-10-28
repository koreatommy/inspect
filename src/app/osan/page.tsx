import { getFacilitiesWithRelations } from "@/lib/osan/queries"
import { OsanApp } from "@/components/osan/osan-app"

export const dynamic = "force-dynamic"

export default async function OsanPage() {
  const facilities = await getFacilitiesWithRelations()

  return (
    <main className="bg-background text-foreground">
      <OsanApp initialFacilities={facilities} />
    </main>
  )
}
