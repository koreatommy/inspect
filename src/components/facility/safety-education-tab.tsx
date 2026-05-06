import type { SafetyEducationRow } from "@/types/database"

export function SafetyEducationTab({
  rows,
}: {
  rows: SafetyEducationRow[]
}) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        등록된 안전교육 정보가 없습니다. 관리자 JSON 업로드 후 확인해 주세요.
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
          <Field label="교육번호" value={row.safety_education_no} />
          <Field label="교육증 번호" value={row.certificate_no} />
          <Field label="교육일" value={row.education_date} />
          <Field label="유효기간" value={row.valid_until} />
          <Field
            label="교육기관"
            value={row.institution_name}
            className="md:col-span-2"
          />
        </dl>
      ))}
    </div>
  )
}

function Field({
  label,
  value,
  className,
}: {
  label: string
  value: string | null
  className?: string
}) {
  return (
    <div className={`rounded-lg border p-3 ${className ?? ""}`}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value && value !== "" ? value : "-"}</dd>
    </div>
  )
}
