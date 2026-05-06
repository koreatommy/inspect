import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { MonthlyInspectionItemRow } from "@/types/database"
import { NoteInput } from "./note-input"
import { ResultSelector } from "./result-selector"

export function EquipmentInspectionTable({
  items,
  disabled = false,
}: {
  items: MonthlyInspectionItemRow[]
  disabled?: boolean
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>번호</TableHead>
          <TableHead>기구명</TableHead>
          <TableHead>기구유형</TableHead>
          <TableHead>설치위치</TableHead>
          <TableHead>인증번호</TableHead>
          <TableHead>점검결과</TableHead>
          <TableHead>점검내용</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={item.id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell className="font-medium">{item.equipment_name}</TableCell>
            <TableCell>{item.equipment_type_name ?? "-"}</TableCell>
            <TableCell>{item.equipment_location ?? "-"}</TableCell>
            <TableCell>{item.certification_no ?? "-"}</TableCell>
            <TableCell>
              <ResultSelector
                itemId={item.id}
                defaultValue={item.result_status}
                disabled={disabled}
              />
            </TableCell>
            <TableCell className="min-w-72">
              <NoteInput
                itemId={item.id}
                defaultValue={item.note}
                disabled={disabled}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
