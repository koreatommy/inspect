import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { FacilityAlertModal } from "@/components/facility/facility-alert-modal"
import { buttonVariants } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

import {
  FacilityDetailTabs,
  FacilityDetailTabsSkeleton,
} from "./facility-detail-tabs"

type FacilityDetailPageProps = {
  params: Promise<{
    facilityNo: string
  }>
  searchParams: Promise<{
    deleted?: string
    error?: string
  }>
}

export default async function FacilityDetailPage({
  params,
  searchParams,
}: FacilityDetailPageProps) {
  const { facilityNo } = await params
  const { deleted, error } = await searchParams
  const decodedFacilityNo = decodeURIComponent(facilityNo)
  const supabase = await createClient()

  const { data: facility } = await supabase
    .from("facilities")
    .select("*")
    .eq("facility_no", decodedFacilityNo)
    .maybeSingle()

  if (!facility) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <FacilityAlertModal deleted={deleted} error={error} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            시설번호 {facility.facility_no}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            {facility.facility_name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {facility.road_address ?? facility.lot_address ?? "주소 없음"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/facilities"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            목록
          </Link>
          <Link
            href={`/inspections/new?facilityNo=${facility.facility_no}`}
            className={cn(buttonVariants())}
          >
            점검 시작
          </Link>
        </div>
      </div>
      <Suspense fallback={<FacilityDetailTabsSkeleton />}>
        <FacilityDetailTabs
          facility={facility}
          facilityNo={decodedFacilityNo}
        />
      </Suspense>
    </div>
  )
}
