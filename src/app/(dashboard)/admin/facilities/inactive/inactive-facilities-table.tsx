import Link from "next/link"

import {
  PaginationControls,
  PaginationRangeSummary,
} from "@/components/data-table/pagination-controls"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 20

type DatasetOption = {
  id: string
  name: string
  status: string
}

type InactiveFacilitiesTableProps = {
  datasets: DatasetOption[]
  currentPage: number
  datasetFilter: string
  query: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export async function InactiveFacilitiesTable({
  datasets,
  currentPage,
  datasetFilter,
  query,
}: InactiveFacilitiesTableProps) {
  const supabase = await createClient()

  let facilityNosInDataset: string[] | null = null
  if (datasetFilter) {
    const { data: memberships } = await supabase
      .from("facility_dataset_memberships")
      .select("facility_no")
      .eq("dataset_id", datasetFilter)

    facilityNosInDataset = (memberships ?? []).map((m) => m.facility_no)
    if (facilityNosInDataset.length === 0) {
      return (
        <EmptyState
          title="해당 데이터셋에 연결된 시설이 없습니다"
          description="다른 데이터셋을 선택하거나 필터를 해제해 주세요."
        />
      )
    }
  }

  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let facilitiesQuery = supabase
    .from("facilities")
    .select(
      "facility_no, facility_name, road_address, lot_address, updated_at",
      { count: "exact" },
    )
    .eq("is_active", false)
    .order("updated_at", { ascending: false })
    .range(from, to)

  if (facilityNosInDataset) {
    facilitiesQuery = facilitiesQuery.in("facility_no", facilityNosInDataset)
  }

  if (query.trim()) {
    const q = query.trim()
    facilitiesQuery = facilitiesQuery.or(
      `facility_no.ilike.%${q}%,facility_name.ilike.%${q}%,road_address.ilike.%${q}%`,
    )
  }

  const { data: facilities, count } = await facilitiesQuery
  const totalCount = count ?? 0
  const facilityNos = (facilities ?? []).map((f) => f.facility_no)

  const datasetNamesByFacility = new Map<string, string[]>()

  if (facilityNos.length > 0) {
    const { data: memberships } = await supabase
      .from("facility_dataset_memberships")
      .select("facility_no,is_active,dataset_id")
      .in("facility_no", facilityNos)

    const datasetIds = [
      ...new Set((memberships ?? []).map((m) => m.dataset_id)),
    ]
    const { data: datasetRows } =
      datasetIds.length > 0
        ? await supabase
            .from("facility_datasets")
            .select("id,name")
            .in("id", datasetIds)
        : { data: [] }

    const nameByDatasetId = new Map(
      (datasetRows ?? []).map((d) => [d.id, d.name]),
    )

    for (const row of memberships ?? []) {
      const dsName = nameByDatasetId.get(row.dataset_id)
      if (!dsName) continue
      const label = row.is_active ? dsName : `${dsName} (멤버십 비활성)`
      const list = datasetNamesByFacility.get(row.facility_no) ?? []
      list.push(label)
      datasetNamesByFacility.set(row.facility_no, list)
    }
  }

  const paginationParams: Record<string, string> = {}
  if (datasetFilter) paginationParams.dataset = datasetFilter
  if (query.trim()) paginationParams.q = query.trim()

  return (
    <div className="space-y-4">
      <form
        method="get"
        action="/admin/facilities/inactive"
        className="flex flex-wrap items-end gap-3"
      >
        <div className="min-w-[12rem] flex-1 space-y-1">
          <label htmlFor="inactive-q" className="text-xs font-medium">
            검색
          </label>
          <Input
            id="inactive-q"
            name="q"
            defaultValue={query}
            placeholder="시설번호·시설명·주소"
          />
        </div>
        <div className="min-w-[12rem] space-y-1">
          <label htmlFor="inactive-dataset" className="text-xs font-medium">
            데이터셋
          </label>
          <select
            id="inactive-dataset"
            name="dataset"
            defaultValue={datasetFilter}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">전체</option>
            {datasets.map((ds) => (
              <option key={ds.id} value={ds.id}>
                {ds.name}
                {ds.status === "archived" ? " (보관)" : ""}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          적용
        </button>
      </form>

      {totalCount === 0 ? (
        <EmptyState
          title="비활성 시설이 없습니다"
          description={
            query || datasetFilter
              ? "검색·필터 조건에 맞는 결과가 없습니다."
              : "현재 전역 비활성 상태인 시설이 없습니다."
          }
        />
      ) : (
        <>
          <PaginationRangeSummary
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>시설번호</TableHead>
                <TableHead>시설명</TableHead>
                <TableHead className="hidden md:table-cell">주소</TableHead>
                <TableHead className="hidden lg:table-cell">데이터셋</TableHead>
                <TableHead className="hidden sm:table-cell">갱신일</TableHead>
                <TableHead>상세</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(facilities ?? []).map((facility) => {
                const datasetLabels =
                  datasetNamesByFacility.get(facility.facility_no) ?? []
                return (
                  <TableRow key={facility.facility_no}>
                    <TableCell className="font-mono text-xs">
                      {facility.facility_no}
                    </TableCell>
                    <TableCell>{facility.facility_name}</TableCell>
                    <TableCell className="hidden max-w-xs truncate md:table-cell text-xs text-muted-foreground">
                      {facility.road_address ?? facility.lot_address ?? "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {datasetLabels.length === 0 ? (
                        <span className="text-xs text-muted-foreground">-</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {datasetLabels.map((name) => (
                            <Badge
                              key={`${facility.facility_no}-${name}`}
                              variant="secondary"
                              className="text-xs font-normal"
                            >
                              {name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                      {formatDate(facility.updated_at)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/facilities/${facility.facility_no}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                        )}
                      >
                        보기
                      </Link>
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
            basePath="/admin/facilities/inactive"
            searchParams={paginationParams}
          />
        </>
      )}
    </div>
  )
}
