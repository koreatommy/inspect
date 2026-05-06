import Link from "next/link"
import { redirect } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { requirePermission } from "@/lib/auth/helpers"
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

async function fetchDraftInspections(
  supabase: Awaited<ReturnType<typeof createClient>>,
  facilityNos: string[]
): Promise<DraftInspection[]> {
  if (facilityNos.length === 0) return []

  const { data } = await supabase
    .from("monthly_inspections")
    .select("id,facility_no,inspection_month")
    .in("facility_no", facilityNos)
    .eq("status", "draft")
    .order("inspection_month", { ascending: false })

  return (data ?? []) as DraftInspection[]
}

export default async function NewInspectionPage({
  searchParams,
}: NewInspectionPageProps) {
  await requirePermission("inspection:create")
  const {
    facilityNo = "",
    error,
    facilityNoQ = "",
    facilityNameQ = "",
    doSearch,
  } = await searchParams

  const noQ = facilityNoQ.trim()
  const nameQ = facilityNameQ.trim()
  const searchSubmitted = doSearch === "1"
  const searchEmpty = searchSubmitted && !noQ && !nameQ

  const supabase = await createClient()

  let facilities: FacilityOption[] = []

  if (searchEmpty) {
    facilities = []
  } else if (noQ || nameQ) {
    let query = supabase
      .from("facilities")
      .select("facility_no,facility_name,road_address")
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
  } else if (facilityNo) {
    const { data } = await supabase
      .from("facilities")
      .select("facility_no,facility_name,road_address")
      .eq("facility_no", facilityNo)
      .maybeSingle()

    facilities = data ? ([data] as FacilityOption[]) : []
  }

  const facilityNos = facilities.map((f) => f.facility_no)
  const drafts = await fetchDraftInspections(supabase, facilityNos)

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
    Boolean(facilityNo) && !noQ && !nameQ && facilities.length === 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
          월간 안전점검 시작
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          시설번호와 점검월 기준으로 작성중 점검을 불러오거나 새 점검을
          생성합니다.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>점검 대상 선택</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              시설번호·시설명으로 검색한 뒤 목록에서 시설을 선택하고 점검을
              시작해 주세요.
            </p>
            <form method="get" action="/inspections/new" className="space-y-3">
              <input type="hidden" name="doSearch" value="1" />
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
              <Button type="submit" variant="secondary">
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
                    <li key={d.id} className="flex items-center gap-2 text-sm">
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

          <form action={createMonthlyInspection} className="space-y-4 border-t pt-6">
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
                      facility.facility_no
                    )
                    const isSelected = selectDefault === facility.facility_no
                    return (
                      <li key={facility.facility_no}>
                        <label
                          className="flex cursor-pointer items-start gap-3 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/60 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                        >
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
                  {directLookupMiss
                    ? "해당 시설번호의 시설을 찾을 수 없습니다."
                    : searchSubmitted && (noQ || nameQ) && !searchEmpty
                      ? "조건에 맞는 시설이 없습니다. 검색어를 바꿔 다시 시도해 주세요."
                      : "검색 결과가 여기에 표시됩니다. 위에서 시설을 검색해 주세요."}
                </p>
              )}
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="inspectionMonth"
                  className="text-sm font-medium"
                >
                  점검월
                </label>
                <Input
                  id="inspectionMonth"
                  name="inspectionMonth"
                  type="month"
                  defaultValue={thisMonth()}
                />
                <p className="text-xs text-muted-foreground">
                  동일 시설·동일 점검월에 이미 점검이 있으면 새로 만들지 않고
                  기존 점검 수정 화면으로 이동합니다.
                </p>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="inspectionDate"
                  className="text-sm font-medium"
                >
                  점검일
                </label>
                <Input
                  id="inspectionDate"
                  name="inspectionDate"
                  type="date"
                  defaultValue={today()}
                />
              </div>
            </div>
            {error ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                점검을 생성할 수 없습니다. 시설과 권한을 확인해 주세요.
              </p>
            ) : null}
            <Button type="submit" disabled={facilities.length === 0}>
              점검 시작
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
