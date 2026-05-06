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
          <TableHead>기구번호</TableHead>
          <TableHead>기구명</TableHead>
          <TableHead>기구형태</TableHead>
          <TableHead>설치위치</TableHead>
          <TableHead>설치일자</TableHead>
          <TableHead>인증번호</TableHead>
          <TableHead>상태</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {equipment.map((item) => (
          <TableRow key={item.equipment_no}>
            <TableCell>{item.equipment_no}</TableCell>
            <TableCell className="font-medium">{item.equipment_name}</TableCell>
            <TableCell>{item.equipment_type_name ?? "-"}</TableCell>
            <TableCell>{item.equipment_location ?? "-"}</TableCell>
            <TableCell>{item.equipment_installed_date ?? "-"}</TableCell>
            <TableCell>{item.certification_no ?? "-"}</TableCell>
            <TableCell>{item.is_active ? "활성" : "비활성"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
