import type { LiabilityInsuranceRow } from "@/types/database"

export function LiabilityInsuranceTab({
  rows,
}: {
  rows: LiabilityInsuranceRow[]
}) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        등록된 보험가입 정보가 없습니다. 관리자 JSON 업로드 후 확인해 주세요.
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
            label="보험상품명"
            value={row.insurance_product_name}
            className="md:col-span-2"
          />
          <Field label="가입일" value={row.join_date} />
          <Field label="만기일" value={row.maturity_date} />
          <Field label="보험증권번호" value={row.insurance_policy_no} />
          <Field label="보험사" value={row.insurer} />
          <Field label="보험관리번호" value={row.insurance_manage_no} />
          <div className="rounded-lg border p-3 md:col-span-2">
            <dt className="text-xs text-muted-foreground">보장내용</dt>
            <dd className="mt-1 whitespace-pre-wrap font-medium">
              {row.insurance_content?.trim()
                ? row.insurance_content
                : "-"}
            </dd>
          </div>
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
