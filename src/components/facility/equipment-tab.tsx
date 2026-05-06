import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { EquipmentRow } from "@/types/database"

export function EquipmentTab({ equipment }: { equipment: EquipmentRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden sm:table-cell">기구번호</TableHead>
          <TableHead>기구명</TableHead>
          <TableHead className="hidden md:table-cell">기구형태</TableHead>
          <TableHead className="hidden sm:table-cell">설치위치</TableHead>
          <TableHead className="hidden lg:table-cell">설치일자</TableHead>
          <TableHead className="hidden lg:table-cell">인증번호</TableHead>
          <TableHead>상태</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {equipment.map((item) => (
          <TableRow key={item.equipment_no}>
            <TableCell className="hidden font-mono text-xs sm:table-cell">
              {item.equipment_no}
            </TableCell>
            <TableCell className="font-medium">
              <div className="flex flex-col gap-0.5">
                <span>{item.equipment_name}</span>
                <span className="text-xs text-muted-foreground sm:hidden">
                  {item.equipment_no}
                  {item.equipment_location
                    ? ` · ${item.equipment_location}`
                    : ""}
                </span>
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {item.equipment_type_name ?? "-"}
            </TableCell>
            <TableCell className="hidden max-w-48 whitespace-normal break-words sm:table-cell">
              {item.equipment_location ?? "-"}
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              {item.equipment_installed_date ?? "-"}
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              {item.certification_no ?? "-"}
            </TableCell>
            <TableCell>{item.is_active ? "활성" : "비활성"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
