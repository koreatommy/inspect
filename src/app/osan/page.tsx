import { getFacilitiesWithRelations } from "@/lib/osan/queries"
import { OsanApp } from "@/components/osan/osan-app"

export const dynamic = "force-dynamic"

export default async function OsanPage() {
  const facilities = await getFacilitiesWithRelations()

  return (
    <main className="min-h-dvh bg-background text-foreground lg:h-dvh lg:overflow-hidden">
      <OsanApp initialFacilities={facilities} />
    </main>
  )
}
