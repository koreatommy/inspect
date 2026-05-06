import { Suspense } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { FacilitiesTable, FacilitiesTableSkeleton } from "./facilities-table"

type FacilitiesPageProps = {
  searchParams: Promise<{
    q?: string
    page?: string
  }>
}

export default async function FacilitiesPage({
  searchParams,
}: FacilitiesPageProps) {
  const { q = "", page: pageStr = "1" } = await searchParams
  const currentPage = Math.max(1, parseInt(pageStr, 10) || 1)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">시설 목록</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          시설번호, 시설명, 주소, 설치장소를 기준으로 검색합니다.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-4">
          <form className="flex flex-col gap-2 sm:flex-row">
            <Input
              name="q"
              defaultValue={q}
              placeholder="시설번호, 시설명, 주소, 설치장소 검색"
              className="flex-1"
            />
            <Button type="submit" className="sm:w-auto">
              검색
            </Button>
          </form>

          <Suspense key={`${q}-${currentPage}`} fallback={<FacilitiesTableSkeleton />}>
            <FacilitiesTable q={q} currentPage={currentPage} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
