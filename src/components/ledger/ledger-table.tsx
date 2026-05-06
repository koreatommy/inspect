import Image from "next/image"

import type { LedgerRow } from "@/types/database"

export type LedgerDisplayRow = Omit<LedgerRow, "id" | "rendered_at"> & {
  id?: string
  safetyManagerSignatureSrc?: string | null
  consignedInspectorSignatureSrc?: string | null
}

const LEDGER_BORDER = "border border-zinc-900"

const resultColHeaderClass = `min-w-0 ${LEDGER_BORDER} p-2 break-words text-center align-middle`

const resultColCellClass = `min-w-0 ${LEDGER_BORDER} p-2 break-words whitespace-normal text-left align-top`

const MONTH_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const

export function LedgerTable({
  rowsByMonth,
}: {
  /** 월(1–12)별 안전점검실시대장 행(해당 월 점검 데이터가 있을 때만 채움) */
  rowsByMonth: ReadonlyMap<number, LedgerDisplayRow>
}) {
  return (
    <div className="ledger-print-table-inner h-full min-h-0 w-full flex-1 overflow-x-auto print:overflow-visible">
      <table className="ledger-annual-table text-center text-sm text-zinc-950 print:text-[9px] print:leading-tight print:[&_th]:px-1 print:[&_th]:py-0.5 print:[&_td]:px-1 print:[&_td]:py-0.5">

        <colgroup>
          <col className="w-[6%]" />
          <col className="w-[10.5%]" />
          <col className="w-[10.5%]" />
          <col className="w-[10.5%]" />
          <col className="w-[10.5%]" />
          <col className="w-[27%]" />
          <col className="w-[12.5%]" />
          <col className="w-[12.5%]" />
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2} className={`${LEDGER_BORDER} p-2`}>
              점검월
            </th>
            <th colSpan={4} className={`${LEDGER_BORDER} p-2`}>
              점검 결과
            </th>
            <th rowSpan={2} className={`${LEDGER_BORDER} p-2`}>
              특이사항
            </th>
            <th rowSpan={2} className={`${LEDGER_BORDER} p-2`}>
              안전관리자(인)
            </th>
            <th rowSpan={2} className={`${LEDGER_BORDER} p-2`}>
              위탁점검자(인)
            </th>
          </tr>
          <tr>
            <th className={resultColHeaderClass}>양호</th>
            <th className={resultColHeaderClass}>요주의</th>
            <th className={resultColHeaderClass}>요수리</th>
            <th className={resultColHeaderClass}>이용금지</th>
          </tr>
        </thead>
        <tbody>
          {MONTH_NUMBERS.map((monthNum) => {
            const row = rowsByMonth.get(monthNum)
            const hasData = Boolean(row)
            const isContentRow = hasData
            return (
              <tr
                key={monthNum}
                className={`align-top ${isContentRow ? "ledger-row-active" : "ledger-row-empty"}`}
              >
                <td className={`${LEDGER_BORDER} p-2`}>{monthNum}월</td>
                {isContentRow && row ? (
                  <>
                    <td className={resultColCellClass}>{row.good_items}</td>
                    <td className={resultColCellClass}>{row.caution_items}</td>
                    <td className={resultColCellClass}>{row.repair_items}</td>
                    <td className={resultColCellClass}>{row.stop_use_items}</td>
                    <td
                      className={`min-w-0 whitespace-pre-wrap ${LEDGER_BORDER} p-2 text-left break-words`}
                    >
                      {row.special_notes}
                    </td>
                    <td className={`${LEDGER_BORDER} p-2`}>
                      {row.safetyManagerSignatureSrc ? (
                        <Image
                          src={row.safetyManagerSignatureSrc}
                          alt="안전관리자 서명"
                          width={220}
                          height={110}
                          unoptimized
                          className="mx-auto h-16 max-h-20 w-auto max-w-full object-contain contrast-[1.08] print:h-14 print:max-h-[72px]"
                        />
                      ) : (
                        row.safety_manager_name_snapshot ?? "-"
                      )}
                    </td>
                    <td className={`${LEDGER_BORDER} p-2`}>
                      {row.consignedInspectorSignatureSrc ? (
                        <Image
                          src={row.consignedInspectorSignatureSrc}
                          alt="위탁점검자 서명"
                          width={220}
                          height={110}
                          unoptimized
                          className="mx-auto h-16 max-h-20 w-auto max-w-full object-contain contrast-[1.08] print:h-14 print:max-h-[72px]"
                        />
                      ) : (
                        row.consigned_inspector_name_snapshot ?? "-"
                      )}
                    </td>
                  </>
                ) : (
                  <>
                    {Array.from({ length: 7 }).map((__, i) => (
                      <td key={i} className={resultColCellClass}>
                        -
                      </td>
                    ))}
                  </>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
