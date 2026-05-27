import Link from "next/link"
import { redirect } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerField } from "@/components/ui/date-picker-field"
import { Input } from "@/components/ui/input"
import { MonthPickerField } from "@/components/ui/month-picker-field"
import {
  getAccessibleDatasets,
  getCurrentRole,
  requirePermission,
  requireUser,
} from "@/lib/auth/helpers"
import { formatDatasetOptionLabel } from "@/lib/dataset/names"
import { getKoreaDateParts } from "@/lib/date"
import { createClient } from "@/lib/supabase/server"
import { createMonthlyInspection } from "./actions"

type FacilityOption = {
  facility_no: string
  facility_name: string
  road_address: string | null
}

type DraftInspection = {
  id: string
  facility_no: string
  inspection_month: string
}

type NewInspectionPageProps = {
  searchParams: Promise<{
    facilityNo?: string
    datasetId?: string
    error?: string
    facilityNoQ?: string
    facilityNameQ?: string
    doSearch?: string
  }>
}

function today() {
  return getKoreaDateParts().date
}

function thisMonth() {
  return getKoreaDateParts().month
}

const ERROR_MESSAGES: Record<string, string> = {
  "facility-required": "시설을 선택해 주세요.",
  "dataset-required":
    "데이터셋을 선택해 주세요. 할당된 데이터셋이 1개면 자동 선택됩니다.",
  "dataset-not-allowed":
    "선택한 데이터셋에 접근 권한이 없습니다. 관리자에게 할당을 요청해 주세요.",
  "facility-not-in-dataset":
    "선택한 시설이 해당 데이터셋의 활성 시설이 아닙니다.",
  "facility-inactive":
    "선택한 시설이 비활성 상태입니다. 다른 시설을 선택해 주세요.",
  "create-failed":
    "점검을 생성할 수 없습니다. 시설과 권한을 확인해 주세요.",
  "item-create-failed":
    "기구 스냅샷 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  forbidden: "해당 작업 권한이 없습니다.",
}

async function fetchDraftInspections(
  supabase: Awaited<ReturnType<typeof createClient>>,
  facilityNos: string[],
  datasetId: string | null,
): Promise<DraftInspection[]> {
  if (facilityNos.length === 0 || !datasetId) return []

  const { data } = await supabase
    .from("monthly_inspections")
    .select("id,facility_no,inspection_month")
    .in("facility_no", facilityNos)
    .eq("status", "draft")
    .eq("dataset_id", datasetId)
    .order("inspection_month", { ascending: false })

  return (data ?? []) as DraftInspection[]
}

async function fetchEligibleFacilityNos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  datasetId: string,
): Promise<Set<string>> {
  const { data } = await supabase
    .from("facility_dataset_memberships")
    .select("facility_no")
    .eq("dataset_id", datasetId)
    .eq("is_active", true)

  return new Set((data ?? []).map((row) => row.facility_no))
}

export default async function NewInspectionPage({
  searchParams,
}: NewInspectionPageProps) {
  await requirePermission("inspection:create")
  const user = await requireUser()
  const role = await getCurrentRole()
  const datasets = await getAccessibleDatasets(user.id, role)

  const {
    facilityNo = "",
    datasetId: requestedDatasetId,
    error,
    facilityNoQ = "",
    facilityNameQ = "",
    doSearch,
  } = await searchParams

  // 단일 할당 자동 선택, 그렇지 않으면 사용자가 선택한 값 사용
  const selectedDatasetId =
    datasets.length === 1
      ? datasets[0]!.id
      : datasets.find((d) => d.id === requestedDatasetId)?.id ?? ""

  const noQ = facilityNoQ.trim()
  const nameQ = facilityNameQ.trim()
  const searchSubmitted = doSearch === "1"
  const searchEmpty = searchSubmitted && !noQ && !nameQ

  const supabase = await createClient()

  let facilities: FacilityOption[] = []
  let eligibleFacilityNos: Set<string> | null = null

  if (datasets.length === 0) {
    facilities = []
  } else if (!selectedDatasetId) {
    facilities = []
  } else {
    eligibleFacilityNos = await fetchEligibleFacilityNos(
      supabase,
      selectedDatasetId,
    )

    if (eligibleFacilityNos.size === 0) {
      facilities = []
    } else if (searchEmpty) {
      facilities = []
    } else if (noQ || nameQ) {
      let query = supabase
        .from("facilities")
        .select("facility_no,facility_name,road_address")
        .in("facility_no", [...eligibleFacilityNos])
        .eq("is_active", true)
        .order("facility_name", { ascending: true })
        .limit(100)

      if (noQ) {
        query = query.ilike("facility_no", `%${noQ}%`)
      }
      if (nameQ) {
        query = query.ilike("facility_name", `%${nameQ}%`)
      }

      const { data } = await query
      facilities = (data ?? []) as FacilityOption[]
    } else if (facilityNo && eligibleFacilityNos.has(facilityNo)) {
      const { data } = await supabase
        .from("facilities")
        .select("facility_no,facility_name,road_address")
        .eq("facility_no", facilityNo)
        .eq("is_active", true)
        .maybeSingle()

      facilities = data ? ([data] as FacilityOption[]) : []
    }
  }

  const facilityNos = facilities.map((f) => f.facility_no)
  const drafts = await fetchDraftInspections(
    supabase,
    facilityNos,
    selectedDatasetId || null,
  )

  const isDirectEntry = Boolean(facilityNo) && !noQ && !nameQ && !doSearch
  if (isDirectEntry && drafts.length > 0) {
    redirect(`/inspections/${drafts[0].id}`)
  }

  const draftsByFacility = new Map<string, DraftInspection[]>()
  for (const d of drafts) {
    const list = draftsByFacility.get(d.facility_no) ?? []
    list.push(d)
    draftsByFacility.set(d.facility_no, list)
  }

  const selectedExists =
    !!facilityNo && facilities.some((f) => f.facility_no === facilityNo)
  const selectDefault = selectedExists ? facilityNo : ""

  const directLookupMiss =
    Boolean(facilityNo) &&
    !noQ &&
    !nameQ &&
    facilities.length === 0 &&
    (eligibleFacilityNos?.size ?? 0) > 0

  const datasetSelectionRequired = datasets.length >= 2
  const noAccessibleDatasets = datasets.length === 0
  const datasetEmpty =
    !!selectedDatasetId &&
    eligibleFacilityNos !== null &&
    eligibleFacilityNos.size === 0

  const errorMessage = error ? ERROR_MESSAGES[error] ?? null : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
          월간 안전점검 시작
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          데이터셋과 시설을 선택해 새 점검을 생성하거나 작성 중 점검을 이어
          작성합니다.
        </p>
      </div>

      {noAccessibleDatasets ? (
        <Card>
          <CardHeader>
            <CardTitle>접근 가능한 데이터셋이 없습니다</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              할당된 데이터셋이 없어 점검을 생성할 수 없습니다. 시스템 관리자에게
              데이터셋 할당을 요청해 주세요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>점검 대상 선택</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {datasetSelectionRequired ? (
              <form
                method="get"
                action="/inspections/new"
                className="flex flex-col gap-2 rounded-lg border border-dashed bg-muted/30 p-3 sm:flex-row sm:items-end"
              >
                {/* 검색 쿼리 보존 */}
                {facilityNoQ ? (
                  <input type="hidden" name="facilityNoQ" value={facilityNoQ} />
                ) : null}
                {facilityNameQ ? (
                  <input type="hidden" name="facilityNameQ" value={facilityNameQ} />
                ) : null}
                {doSearch ? (
                  <input type="hidden" name="doSearch" value={doSearch} />
                ) : null}
                <div className="flex-1 space-y-1">
                  <label htmlFor="datasetIdSelector" className="text-sm font-medium">
                    데이터셋
                  </label>
                  <select
                    id="datasetIdSelector"
                    name="datasetId"
                    defaultValue={selectedDatasetId}
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">데이터셋을 선택하세요</option>
                    {datasets.map((d) => (
                      <option key={d.id} value={d.id}>
                        {formatDatasetOptionLabel(d.name, d.facility_count)}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" variant="secondary">
                  데이터셋 적용
                </Button>
              </form>
            ) : datasets.length === 1 ? (
              <p className="text-sm text-muted-foreground">
                현재 데이터셋:{" "}
                <span className="font-medium text-foreground">
                  {formatDatasetOptionLabel(
                    datasets[0]!.name,
                    datasets[0]!.facility_count,
                  )}
                </span>
              </p>
            ) : null}

            {datasetEmpty ? (
              <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
                선택한 데이터셋에 활성 시설이 없습니다. 다른 데이터셋을 선택하거나
                JSON 업로드로 시설을 추가해 주세요.
              </p>
            ) : null}

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                시설번호·시설명으로 검색한 뒤 목록에서 시설을 선택하고 점검을
                시작해 주세요.
              </p>
              <form method="get" action="/inspections/new" className="space-y-3">
                <input type="hidden" name="doSearch" value="1" />
                {selectedDatasetId ? (
                  <input
                    type="hidden"
                    name="datasetId"
                    value={selectedDatasetId}
                  />
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="facilityNoQ" className="text-sm font-medium">
                      시설번호
                    </label>
                    <Input
                      id="facilityNoQ"
                      name="facilityNoQ"
                      defaultValue={facilityNoQ}
                      placeholder="예: 35631"
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="facilityNameQ" className="text-sm font-medium">
                      시설명
                    </label>
                    <Input
                      id="facilityNameQ"
                      name="facilityNameQ"
                      defaultValue={facilityNameQ}
                      placeholder="시설명 일부"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={!selectedDatasetId}
                >
                  검색
                </Button>
              </form>
              {searchEmpty ? (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  시설번호 또는 시설명 중 하나 이상 입력한 뒤 검색해 주세요.
                </p>
              ) : null}
            </div>

            {drafts.length > 0 && (
              <div className="space-y-2 rounded-lg border border-warning/40 bg-warning/10 p-4">
                <p className="text-sm font-medium text-warning-foreground">
                  작성중인 점검이 있습니다
                </p>
                <ul className="space-y-1">
                  {drafts.map((d) => {
                    const fName =
                      facilities.find((f) => f.facility_no === d.facility_no)
                        ?.facility_name ?? d.facility_no
                    return (
                      <li
                        key={d.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Badge variant="outline" className="shrink-0">
                          작성중
                        </Badge>
                        <span className="truncate">
                          {fName} — {d.inspection_month}
                        </span>
                        <Link
                          href={`/inspections/${d.id}`}
                          className="ml-auto shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
                        >
                          이어서 작성
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            <form
              action={createMonthlyInspection}
              className="space-y-4 border-t pt-6"
            >
              {selectedDatasetId ? (
                <input type="hidden" name="datasetId" value={selectedDatasetId} />
              ) : null}
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">시설 선택</legend>
                {facilities.length > 0 ? (
                  <ul
                    role="radiogroup"
                    aria-label="시설 선택"
                    className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto rounded-lg border bg-muted/20 p-2"
                  >
                    {facilities.map((facility) => {
                      const facilityDrafts = draftsByFacility.get(
                        facility.facility_no,
                      )
                      const isSelected = selectDefault === facility.facility_no
                      return (
                        <li key={facility.facility_no}>
                          <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/60 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                            <input
                              type="radio"
                              name="facilityNo"
                              value={facility.facility_no}
                              defaultChecked={isSelected}
                              required
                              className="mt-1 size-4 shrink-0 accent-primary"
                            />
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex flex-wrap items-baseline gap-x-2">
                                <p className="font-medium break-words">
                                  {facility.facility_name}
                                </p>
                                <span className="font-mono text-xs text-muted-foreground">
                                  {facility.facility_no}
                                </span>
                              </div>
                              {facility.road_address ? (
                                <p className="text-xs text-muted-foreground break-words">
                                  {facility.road_address}
                                </p>
                              ) : null}
                              {facilityDrafts && facilityDrafts.length > 0 ? (
                                <p className="flex flex-wrap items-center gap-1 text-xs">
                                  <Badge variant="outline" className="shrink-0">
                                    작성중
                                  </Badge>
                                  <span className="text-muted-foreground">
                                    {facilityDrafts
                                      .map((d) => d.inspection_month)
                                      .join(", ")}
                                  </span>
                                </p>
                              ) : null}
                            </div>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-6 text-center text-sm text-muted-foreground">
                    {!selectedDatasetId
                      ? "먼저 데이터셋을 선택해 주세요."
                      : datasetEmpty
                        ? "데이터셋에 활성 시설이 없습니다."
                        : directLookupMiss
                          ? "해당 시설번호의 시설을 찾을 수 없거나 데이터셋 범위 밖입니다."
                          : searchSubmitted && (noQ || nameQ) && !searchEmpty
                            ? "조건에 맞는 시설이 없습니다. 검색어를 바꿔 다시 시도해 주세요."
                            : "검색 결과가 여기에 표시됩니다. 위에서 시설을 검색해 주세요."}
                  </p>
                )}
              </fieldset>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="inspectionMonth" className="text-sm font-medium">
                    점검월
                  </label>
                  <MonthPickerField
                    id="inspectionMonth"
                    name="inspectionMonth"
                    defaultValue={thisMonth()}
                    clearable={false}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    동일 시설·동일 데이터셋·동일 점검월에 이미 점검이 있으면
                    새로 만들지 않고 기존 점검 수정 화면으로 이동합니다.
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="inspectionDate" className="text-sm font-medium">
                    점검일
                  </label>
                  <DatePickerField
                    id="inspectionDate"
                    name="inspectionDate"
                    defaultValue={today()}
                    clearable={false}
                    required
                  />
                </div>
              </div>
              {errorMessage ? (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMessage}
                </p>
              ) : null}
              <Button
                type="submit"
                disabled={facilities.length === 0 || !selectedDatasetId}
              >
                점검 시작
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
