import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type DatasetInspectionStats = {
  datasetId: string
  datasetName: string
  draftCount: number
  completedCount: number
  /** 해당 데이터셋에서 이번 달 점검이 완료되지 않은 시설 수 */
  incompleteFacilityCount: number
}

function inspectionCountFor(row: DatasetInspectionStats) {
  return row.draftCount + row.completedCount
}

export function DatasetInspectionBreakdown({
  monthLabel,
  rows,
}: {
  monthLabel: string
  rows: DatasetInspectionStats[]
}) {
  if (rows.length <= 1) return null

  const grandInspectionTotal = rows.reduce(
    (sum, row) => sum + inspectionCountFor(row),
    0,
  )

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          데이터셋별 점검 현황 ({monthLabel})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>데이터셋</TableHead>
              <TableHead className="text-right">작성중</TableHead>
              <TableHead className="text-right">완료</TableHead>
              <TableHead className="text-right hidden sm:table-cell">
                미완료
              </TableHead>
              <TableHead className="text-right">점검 합계</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.datasetId}>
                <TableCell>
                  <span className="font-medium">{row.datasetName}</span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.draftCount}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.completedCount}
                </TableCell>
                <TableCell className="text-right tabular-nums hidden sm:table-cell">
                  {row.incompleteFacilityCount}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {inspectionCountFor(row)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/40">
              <TableCell className="font-medium">전체</TableCell>
              <TableCell className="text-right tabular-nums font-medium">
                {rows.reduce((s, r) => s + r.draftCount, 0)}
              </TableCell>
              <TableCell className="text-right tabular-nums font-medium">
                {rows.reduce((s, r) => s + r.completedCount, 0)}
              </TableCell>
              <TableCell className="text-right tabular-nums font-medium hidden sm:table-cell">
                {rows.reduce((s, r) => s + r.incompleteFacilityCount, 0)}
              </TableCell>
              <TableCell className="text-right tabular-nums font-semibold">
                {grandInspectionTotal}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <p className="mt-3 text-xs text-muted-foreground">
          작성중·완료·점검 합계는 점검 건수, 미완료는 시설 수 기준입니다.
          동일 시설·동일 월이라도 데이터셋이 다르면 별도 점검으로 집계됩니다.
        </p>
      </CardContent>
    </Card>
  )
}

/** 이력·최근 점검 테이블용 데이터셋 배지 */
export function DatasetNameBadge({ name }: { name: string }) {
  return (
    <Badge variant="secondary" className="max-w-[10rem] truncate font-normal">
      {name}
    </Badge>
  )
}
