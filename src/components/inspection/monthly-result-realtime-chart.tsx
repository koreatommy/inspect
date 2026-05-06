"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

type ResultStatus = "GOOD" | "CAUTION" | "REPAIR" | "STOP_USE"

type ChartItem = {
  key: ResultStatus
  name: string
  count: number
  color: string
}

const LABEL_BY_STATUS: Record<ResultStatus, string> = {
  GOOD: "양호",
  CAUTION: "요주의",
  REPAIR: "요수리",
  STOP_USE: "이용금지",
}

const COLOR_BY_STATUS: Record<ResultStatus, string> = {
  GOOD: "var(--chart-2)",
  CAUTION: "var(--chart-4)",
  REPAIR: "var(--chart-5)",
  STOP_USE: "var(--destructive)",
}

const ORDER: ResultStatus[] = ["GOOD", "CAUTION", "REPAIR", "STOP_USE"]

type MonthlyResultRealtimeChartProps = {
  inspectionMonth: string
}

async function fetchMonthlyCounts(inspectionMonth: string) {
  const supabase = createClient()
  const { data: inspections, error: inspectionError } = await supabase
    .from("monthly_inspections")
    .select("id")
    .eq("inspection_month", inspectionMonth)

  if (inspectionError) throw inspectionError

  const inspectionIds = (inspections ?? []).map((row) => row.id)
  if (inspectionIds.length === 0) {
    return {
      GOOD: 0,
      CAUTION: 0,
      REPAIR: 0,
      STOP_USE: 0,
    } satisfies Record<ResultStatus, number>
  }

  const { data: items, error: itemError } = await supabase
    .from("monthly_inspection_items")
    .select("result_status")
    .in("inspection_id", inspectionIds)

  if (itemError) throw itemError

  const counts: Record<ResultStatus, number> = {
    GOOD: 0,
    CAUTION: 0,
    REPAIR: 0,
    STOP_USE: 0,
  }

  for (const item of items ?? []) {
    const status = item.result_status as ResultStatus
    counts[status] += 1
  }

  return counts
}

export function MonthlyResultRealtimeChart({
  inspectionMonth,
}: MonthlyResultRealtimeChartProps) {
  const [counts, setCounts] = useState<Record<ResultStatus, number>>({
    GOOD: 0,
    CAUTION: 0,
    REPAIR: 0,
    STOP_USE: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const next = await fetchMonthlyCounts(inspectionMonth)
      setCounts(next)
      setError(null)
    } catch (err) {
      console.error("[MonthlyResultRealtimeChart] refresh failed", err)
      setError("그래프 데이터를 불러오지 못했습니다.")
    } finally {
      setLoading(false)
    }
  }, [inspectionMonth])

  useEffect(() => {
    const bootTimer = window.setTimeout(() => {
      void refresh()
    }, 0)

    const supabase = createClient()
    const channel = supabase
      .channel(`inspection-result-${inspectionMonth}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "monthly_inspection_items",
        },
        () => {
          void refresh()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "monthly_inspections",
          filter: `inspection_month=eq.${inspectionMonth}`,
        },
        () => {
          void refresh()
        }
      )
      .subscribe()

    // Realtime이 비활성화된 환경에서도 일정 주기로 수치를 최신화합니다.
    const intervalId = window.setInterval(() => {
      void refresh()
    }, 15000)

    return () => {
      window.clearTimeout(bootTimer)
      window.clearInterval(intervalId)
      void supabase.removeChannel(channel)
    }
  }, [inspectionMonth, refresh])

  const chartData = useMemo<ChartItem[]>(
    () =>
      ORDER.map((status) => ({
        key: status,
        name: LABEL_BY_STATUS[status],
        count: counts[status],
        color: COLOR_BY_STATUS[status],
      })),
    [counts]
  )

  const total = chartData.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          월간안전점검 결과 실시간 그래프 ({inspectionMonth})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <Tooltip
                formatter={(value) => [`${value}건`, "건수"]}
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--card)",
                  color: "var(--card-foreground)",
                  fontSize: "0.875rem",
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {chartData.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}
              </span>
              <span className="font-semibold tabular-nums">{item.count}건</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t pt-2 text-sm">
          <span className="text-muted-foreground">합계</span>
          <span className="font-semibold tabular-nums">{total}건</span>
        </div>
        {loading ? (
          <p className="text-xs text-muted-foreground">그래프를 불러오는 중입니다...</p>
        ) : null}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  )
}
