import Link from "next/link"

import {
  PaginationControls,
  PaginationRangeSummary,
} from "@/components/data-table/pagination-controls"
import { EmptyState } from "@/components/ui/empty-state"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getKoreaDateParts } from "@/lib/date"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 20

type FacilitiesPageProps = {
  searchParams: Promise<{
    q?: string
    page?: string
  }>
}

export default async function FacilitiesPage({
  searchParams,
}: FacilitiesPageProps) {
  const { q = "", page: pageStr = "1" } = await searchParams
  const currentPage = Math.max(1, parseInt(pageStr, 10) || 1)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  const currentMonth = getKoreaDateParts().month

  const supabase = await createClient()
  let query = supabase
    .from("facilities")
    .select(
      "facility_no, facility_name, road_address, lot_address, install_place_name, duty_type_name, public_private_name, indoor_outdoor_name",
      { count: "exact" }
    )
    .order("facility_name", { ascending: true })
    .range(from, to)

  if (q) {
    query = query.or(
      `facility_no.ilike.%${q}%,facility_name.ilike.%${q}%,road_address.ilike.%${q}%,lot_address.ilike.%${q}%,install_place_name.ilike.%${q}%`
    )
  }

  const { data: facilities, count } = await query
  const totalCount = count ?? 0
  const facilityNos = (facilities ?? []).map((facility) => facility.facility_no)
  const inspectionStatusByFacilityNo = new Map<string, "완료" | "미완료">()

  if (facilityNos.length > 0) {
    const { data: monthlyInspections } = await supabase
      .from("monthly_inspections")
      .select("facility_no,status")
      .in("facility_no", facilityNos)
      .eq("inspection_month", currentMonth)

    for (const inspection of monthlyInspections ?? []) {
      const isCompleted =
        inspection.status === "completed" || inspection.status === "locked"
      inspectionStatusByFacilityNo.set(
        inspection.facility_no,
        isCompleted ? "완료" : "미완료"
      )
    }
  }

  const paginationSearchParams: Record<string, string> = {}
  if (q) paginationSearchParams.q = q

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">시설 목록</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          시설번호, 시설명, 주소, 설치장소를 기준으로 검색합니다.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-4">
          <form className="flex flex-col gap-2 sm:flex-row">
            <Input
              name="q"
              defaultValue={q}
              placeholder="시설번호, 시설명, 주소, 설치장소 검색"
              className="flex-1"
            />
            <Button type="submit" className="sm:w-auto">
              검색
            </Button>
          </form>

          {(facilities ?? []).length > 0 ? (
            <>
              <div className="flex justify-end">
                <PaginationRangeSummary
                  currentPage={currentPage}
                  totalCount={totalCount}
                  pageSize={PAGE_SIZE}
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>시설번호</TableHead>
                    <TableHead>시설명</TableHead>
                    <TableHead className="hidden md:table-cell">주소</TableHead>
                    <TableHead className="hidden sm:table-cell">설치장소</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      월별점검 현황 ({currentMonth})
                    </TableHead>
                    <TableHead>액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(facilities ?? []).map((facility) => {
                    const monthlyStatus =
                      inspectionStatusByFacilityNo.get(facility.facility_no) ??
                      "미완료"
                    const isCompleted = monthlyStatus === "완료"

                    return (
                    <TableRow key={facility.facility_no}>
                      <TableCell className="font-mono text-xs">
                        {facility.facility_no}
                      </TableCell>
                      <TableCell className="font-medium">
                        {facility.facility_name}
                      </TableCell>
                      <TableCell className="hidden max-w-sm whitespace-normal md:table-cell">
                        {facility.road_address ?? facility.lot_address ?? "-"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {facility.install_place_name ?? "-"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span
                          className={cn(
                            "font-medium",
                            isCompleted
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {monthlyStatus}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link
                            href={`/facilities/${facility.facility_no}`}
                            className={cn(
                              buttonVariants({ variant: "outline", size: "sm" })
                            )}
                          >
                            상세
                          </Link>
                          <Link
                            href={`/inspections/new?facilityNo=${facility.facility_no}`}
                            className={cn(buttonVariants({ size: "sm" }))}
                          >
                            점검
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              <PaginationControls
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={PAGE_SIZE}
                basePath="/facilities"
                searchParams={paginationSearchParams}
              />
            </>
          ) : (
            <EmptyState
              title="등록된 시설이 없습니다"
              description={q ? `"${q}" 검색 결과가 없습니다.` : "JSON 업로드로 시설을 등록해 주세요."}
              actionLabel={q ? undefined : "JSON 업로드"}
              actionHref={q ? undefined : "/admin/upload"}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
