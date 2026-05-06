import type { FacilityLegalInspectionRow } from "@/types/database"

function passYnLabel(value: string | null) {
  if (value === "Y") {
    return "합격"
  }
  if (value === "N") {
    return "불합격"
  }
  return value ?? "-"
}

export function LegalInspectionTab({
  rows,
}: {
  rows: FacilityLegalInspectionRow[]
}) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        등록된 정기시설검사 정보가 없습니다. 관리자 JSON 업로드 후 확인해 주세요.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {rows.map((row) => (
        <dl
          key={row.id}
          className="grid gap-3 md:grid-cols-2 rounded-lg border p-4"
        >
          <div className="rounded-lg border bg-muted/30 p-3 md:col-span-2">
            <dt className="text-xs text-muted-foreground">검사종류</dt>
            <dd className="mt-1 font-medium">
              {row.inspection_type_name ?? row.inspection_type_code ?? "-"}
            </dd>
          </div>
          <Field label="검사일" value={row.inspection_date} />
          <Field label="판정일" value={row.judgment_date} />
          <Field label="유효기간" value={row.valid_until} />
          <Field label="설치일자" value={row.installed_date} />
          <Field label="합격 여부" value={passYnLabel(row.pass_yn)} />
          <Field label="검사번호" value={row.inspection_no} />
          <Field label="검사담당자" value={row.inspection_pic} />
        </dl>
      ))}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value && value !== "" ? value : "-"}</dd>
    </div>
  )
}
