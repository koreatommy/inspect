import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { requirePermission } from "@/lib/auth/helpers"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

import { InactiveFacilitiesTable } from "./inactive-facilities-table"

type PageProps = {
  searchParams: Promise<{ page?: string; dataset?: string; q?: string }>
}

export default async function InactiveFacilitiesPage({
  searchParams,
}: PageProps) {
  await requirePermission("facility:upload")

  const { page: pageRaw, dataset: datasetId, q } = await searchParams
  const currentPage = Math.max(1, Number(pageRaw) || 1)

  const supabase = await createClient()
  const { data: datasets } = await supabase
    .from("facility_datasets")
    .select("id,name,status")
    .order("name", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            비활성 시설
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            전역 비활성(<code className="text-xs">facilities.is_active=false</code>
            ) 시설 목록입니다. 재활성은 해당 데이터셋 JSON에 시설을 다시
            포함해 업로드하는 것을 권장합니다.
          </p>
        </div>
        <Link
          href="/admin/upload"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          JSON 업로드
        </Link>
      </div>

      <InactiveFacilitiesTable
        datasets={datasets ?? []}
        currentPage={currentPage}
        datasetFilter={datasetId ?? ""}
        query={q ?? ""}
      />
    </div>
  )
}
