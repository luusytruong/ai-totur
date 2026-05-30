"use client"

import { useMemo } from "react"
import { Pie, PieChart, Sector } from "recharts"
import type { PieSectorShapeProps } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { UserAnalyticsData } from "@workspace/types"

const DEFAULT_CATEGORIES = [
  "Logic",
  "Cú pháp",
  "Thuật toán",
  "Gỡ lỗi",
  "Tốc độ",
]

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-1)",
]

const chartConfig = {
  value: {
    label: "Mức độ",
  },
  logic: {
    label: "Logic",
    color: "var(--chart-1)",
  },
  syntax: {
    label: "Cú pháp",
    color: "var(--chart-2)",
  },
  algo: {
    label: "Thuật toán",
    color: "var(--chart-3)",
  },
  debug: {
    label: "Gỡ lỗi",
    color: "var(--chart-4)",
  },
  speed: {
    label: "Tốc độ",
    color: "var(--chart-5)",
  },
  other: {
    label: "Khác",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const ACTIVE_INDEX = 0

export function SkillsPie({
  data,
}: {
  data?: UserAnalyticsData["analytics"] | null
}) {
  const chartData = useMemo(() => {
    const knownTopics = data?.knownTopics || []
    if (knownTopics.length === 0) {
      return DEFAULT_CATEGORIES.map((cat, i) => ({
        skill: cat,
        value: 20,
        fill: COLORS[i] || COLORS[0],
      }))
    }

    const uniqueTopics = Array.from(
      new Set([...knownTopics, ...DEFAULT_CATEGORIES])
    ).slice(0, 5)

    return uniqueTopics.map((cat, i) => {
      let val = 50
      if (knownTopics.includes(cat.toLowerCase())) {
        val += 30
      }
      return {
        skill: cat,
        value: val,
        fill: COLORS[i] || COLORS[5],
      }
    })
  }, [data])

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-sm font-bold">Phân bổ Kỹ năng</CardTitle>
        <CardDescription className="text-xs">
          Dựa trên lịch sử bài tập
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="skill"
              innerRadius={60}
              strokeWidth={5}
              shape={({
                index,
                outerRadius = 0,
                ...props
              }: PieSectorShapeProps) =>
                index === ACTIVE_INDEX ? (
                  <Sector {...props} outerRadius={outerRadius + 10} />
                ) : (
                  <Sector {...props} outerRadius={outerRadius} />
                )
              }
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
