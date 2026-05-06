import Image from "next/image"

import type { LedgerDisplayRow } from "./ledger-table"

const MONTH_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const

export function LedgerMobileSummary({
  rowsByMonth,
}: {
  rowsByMonth: ReadonlyMap<number, LedgerDisplayRow>
}) {
  const monthsWithData = MONTH_NUMBERS.filter((m) => rowsByMonth.has(m))

  if (monthsWithData.length === 0) {
    return (
      <p className="rounded-lg border border-dashed bg-muted/40 p-4 text-center text-sm text-muted-foreground md:hidden print:hidden">
        해당 연도에 작성된 점검이 아직 없습니다.
      </p>
    )
  }

  return (
    <div className="md:hidden print:hidden">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">월별 요약</h3>
        <span className="text-xs text-muted-foreground">
          {monthsWithData.length}개월
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {monthsWithData.map((monthNum) => {
          const row = rowsByMonth.get(monthNum)
          if (!row) return null
          return (
            <li
              key={monthNum}
              className="rounded-lg border bg-background p-3 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold">{monthNum}월</p>
              </div>

              <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                <SummaryItem label="양호" value={row.good_items} />
                <SummaryItem label="요주의" value={row.caution_items} />
                <SummaryItem label="요수리" value={row.repair_items} />
                <SummaryItem label="이용금지" value={row.stop_use_items} />
              </dl>

              {row.special_notes ? (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    특이사항
                  </p>
                  <p className="whitespace-pre-wrap break-words text-sm">
                    {row.special_notes}
                  </p>
                </div>
              ) : null}

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <SignatureBlock
                  label="안전관리자"
                  name={row.safety_manager_name_snapshot ?? null}
                  src={row.safetyManagerSignatureSrc ?? null}
                />
                <SignatureBlock
                  label="위탁점검자"
                  name={row.consigned_inspector_name_snapshot ?? null}
                  src={row.consignedInspectorSignatureSrc ?? null}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SummaryItem({
  label,
  value,
}: {
  label: string
  value: string | null
}) {
  return (
    <>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm">{value ?? "-"}</dd>
    </>
  )
}

function SignatureBlock({
  label,
  name,
  src,
}: {
  label: string
  name: string | null
  src: string | null
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {src ? (
        <Image
          src={src}
          alt={`${label} 서명`}
          width={160}
          height={60}
          unoptimized
          className="h-12 w-auto max-w-full self-start object-contain contrast-[1.08]"
        />
      ) : (
        <p className="text-sm">{name ?? "-"}</p>
      )}
    </div>
  )
}
