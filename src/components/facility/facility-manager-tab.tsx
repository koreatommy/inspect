import type { FacilityManagerRow } from "@/types/database"

export function FacilityManagerTab({
  rows,
}: {
  rows: FacilityManagerRow[]
}) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        등록된 관리주체 정보가 없습니다. 관리자 JSON 업로드 후 확인해 주세요.
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
          <Field
            label="관리구분"
            value={
              row.manager_type_name?.trim()
                ? row.manager_type_name
                : row.manager_type_code
            }
          />
          <Field
            label="시설대표구분"
            value={
              row.facility_representative_name?.trim()
                ? row.facility_representative_name
                : row.facility_representative_code
            }
          />
          <Field
            label="관리주체명"
            value={row.company_name}
            className="md:col-span-2"
          />
          <Field label="대표자명" value={row.representative_name} />
          <Field label="사업자번호" value={row.business_no} />
          <Field label="전화번호" value={row.tel_no} />
          <Field label="팩스번호" value={row.fax_no} />
          <Field label="이메일" value={row.email} className="md:col-span-2" />
          <Field label="주소" value={row.road_address} className="md:col-span-2" />
          <Field label="관리담당번호" value={row.manager_no} />
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
  value: string | null | undefined
  className?: string
}) {
  const display =
    value !== null && value !== undefined && String(value).trim() !== ""
      ? String(value)
      : "-"
  return (
    <div className={`rounded-lg border p-3 ${className ?? ""}`}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{display}</dd>
    </div>
  )
}
