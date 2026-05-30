"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useMemo } from "react"
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts"

const DEFAULT_CATEGORIES = [
  "Logic",
  "Cú pháp",
  "Thuật toán",
  "Gỡ lỗi",
  "Tốc độ",
]

const chartConfig = {
  value: {
    label: "Kỹ năng",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function SkillsRadar({ data }: { data?: string[] | null }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return DEFAULT_CATEGORIES.map((cat) => ({
        skill: cat,
        value: 75,
      }))
    }

    // Simple mapping: if topic exists in user's known topics, give it higher value
    return DEFAULT_CATEGORIES.map((cat) => ({
      skill: cat,
      value: data?.includes(cat.toLowerCase()) ? 90 : 60,
    }))
  }, [data])

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Phân tích kỹ năng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full lg:h-[280px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <PolarGrid className="fill-[--color-value] opacity-10" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <Radar
                  dataKey="value"
                  fill="var(--primary)"
                  fillOpacity={0.4}
                  stroke="var(--primary)"
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-md bg-emerald-500/10 p-2 text-center">
            <p className="text-[10px] text-muted-foreground">Điểm mạnh</p>
            <p className="text-xs font-bold text-emerald-600 uppercase">
              Gỡ lỗi
            </p>
          </div>
          <div className="rounded-md bg-rose-500/10 p-2 text-center">
            <p className="text-[10px] text-muted-foreground">Điểm yếu</p>
            <p className="text-xs font-bold text-rose-600 uppercase">
              Thuật toán
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
