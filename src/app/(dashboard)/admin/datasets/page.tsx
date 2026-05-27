import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requirePermission } from "@/lib/auth/helpers"
import { cn } from "@/lib/utils"

import { listAllDatasets } from "./actions"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export default async function AdminDatasetsPage() {
  await requirePermission("facility:upload")
  const datasets = await listAllDatasets()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            데이터셋 관리
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            JSON 업로드 단위별 시설 스냅샷·사용자 할당·보관 상태를 관리합니다.
          </p>
        </div>
        <Link
          href="/admin/upload"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          JSON 업로드
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead className="hidden md:table-cell">상태</TableHead>
            <TableHead className="text-right">시설 수</TableHead>
            <TableHead className="hidden sm:table-cell text-right">
              할당 사용자
            </TableHead>
            <TableHead className="hidden lg:table-cell">최근 파일</TableHead>
            <TableHead className="hidden lg:table-cell">생성일</TableHead>
            <TableHead>상세</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {datasets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                등록된 데이터셋이 없습니다. JSON 업로드로 첫 데이터셋을
                만들어 주세요.
              </TableCell>
            </TableRow>
          ) : (
            datasets.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="font-medium">{row.name}</div>
                  {row.description ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {row.description}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge
                    variant={row.status === "active" ? "default" : "secondary"}
                  >
                    {row.status === "active" ? "활성" : "보관"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.facility_count}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-right tabular-nums">
                  {row.assigned_user_count}
                </TableCell>
                <TableCell className="hidden max-w-[12rem] truncate lg:table-cell text-xs text-muted-foreground">
                  {row.source_file ?? "-"}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                  {formatDate(row.created_at)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/datasets/${row.id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    보기
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
