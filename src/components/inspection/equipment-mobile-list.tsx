import type { MonthlyInspectionItemRow } from "@/types/database"

import { NoteInput } from "./note-input"
import { ResultSelector } from "./result-selector"

export function EquipmentMobileList({
  items,
  disabled = false,
}: {
  items: MonthlyInspectionItemRow[]
  disabled?: boolean
}) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, index) => (
        <li
          key={item.id}
          className="rounded-lg border bg-background p-3 shadow-sm"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{index + 1}번</p>
              <p className="truncate font-medium">{item.equipment_name}</p>
            </div>
            <ResultSelector
              itemId={item.id}
              defaultValue={item.result_status}
              disabled={disabled}
              className="h-9 w-28 shrink-0"
            />
          </div>

          <dl className="mb-3 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <dt className="font-medium text-foreground/70">기구유형</dt>
            <dd className="break-words">{item.equipment_type_name ?? "-"}</dd>
            <dt className="font-medium text-foreground/70">설치위치</dt>
            <dd className="break-words">{item.equipment_location ?? "-"}</dd>
            <dt className="font-medium text-foreground/70">인증번호</dt>
            <dd className="break-words">{item.certification_no ?? "-"}</dd>
          </dl>

          <div className="space-y-1">
            <label
              htmlFor={`note-mobile-${item.id}`}
              className="text-xs font-medium text-foreground/70"
            >
              점검내용
            </label>
            <NoteInput
              itemId={item.id}
              defaultValue={item.note}
              disabled={disabled}
              inputId={`note-mobile-${item.id}`}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
