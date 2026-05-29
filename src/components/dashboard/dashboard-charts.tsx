"use client"

import {
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ChartBox } from "@/components/charts/chart-box"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type MonthlyData = {
  monthLabel: string
  totalCount: number
}

type StatusData = {
  name: string
  value: number
  color: string
}

export function MonthlyInspectionTrendChart({ data }: { data: MonthlyData[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">월별 점검 현황</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartBox className="h-[260px]">
            <LineChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <Tooltip
                formatter={(value) => [`${value}건`, "점검건수"]}
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--card)",
                  color: "var(--card-foreground)",
                  fontSize: "0.875rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="totalCount"
                name="점검건수"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 5 }}
              >
                <LabelList
                  dataKey="totalCount"
                  position="top"
                  formatter={(value) => (value != null ? String(value) : "")}
                  className="fill-muted-foreground"
                  fontSize={11}
                />
              </Line>
            </LineChart>
        </ChartBox>
      </CardContent>
    </Card>
  )
}

export function StatusDonutChart({ data }: { data: StatusData[] }) {
  const inspectionTotal = data
    .filter((d) => d.name !== "미완료")
    .reduce((sum, d) => sum + d.value, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">이번 달 점검 상태</CardTitle>
        <p className="text-xs text-muted-foreground">
          완료·작성중은 점검 건수, 미완료는 멤버십 시설 수 기준입니다.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <ChartBox className="h-[200px] w-[200px] shrink-0">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    color: "var(--card-foreground)",
                    fontSize: "0.875rem",
                  }}
                />
              </PieChart>
          </ChartBox>

          <div className="w-full space-y-3 sm:w-auto">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="size-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm">{entry.name}</span>
                <span className="ml-auto text-sm font-semibold tabular-nums">
                  {entry.value}
                </span>
              </div>
            ))}
            <div className="flex items-center border-t pt-2">
              <span className="text-sm text-muted-foreground">점검 합계</span>
              <span className="ml-auto text-sm font-semibold tabular-nums">
                {inspectionTotal}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
