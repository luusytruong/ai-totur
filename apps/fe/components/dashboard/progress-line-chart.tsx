"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Dot, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useMemo } from "react"

const chartConfig = {
  xp: {
    label: "XP",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ProgressLineChart({
  data,
}: {
  data?: Array<{ date: string; xp: number }>
}) {
  const chartData = useMemo(() => {
    return (data ?? []).map((item, i) => ({
      day: format(new Date(item.date), "dd/MM"),
      xp: item.xp,
      fill: `var(--chart-${(i % 5) + 1})`,
    }))
  }, [data])

  const hasData = chartData.length > 0

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          Tiến độ học tập (XP)
        </CardTitle>
        <CardDescription className="text-xs">
          Hoạt động trong 7 ngày qua
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-50 w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 24,
                left: 24,
                right: 24,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                hide
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    nameKey="xp"
                    hideLabel
                  />
                }
              />
              <Line
                dataKey="xp"
                type="natural"
                stroke="var(--color-xp)"
                strokeWidth={2}
                dot={({ payload, ...props }) => {
                  return (
                    <Dot
                      key={payload.day}
                      r={5}
                      cx={props.cx}
                      cy={props.cy}
                      fill={payload.fill}
                      stroke={payload.fill}
                    />
                  )
                }}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex h-50 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/20 px-4 text-center">
            <p className="text-sm font-medium text-foreground">
              Chưa có dữ liệu XP thật
            </p>
            <p className={cn("max-w-xs text-xs text-muted-foreground")}> 
              Hoàn thành vài bài tập để biểu đồ tiến độ được tạo từ dữ liệu bài nộp thực tế.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium text-emerald-600">
          Hoàn thành bài tập để nhận thêm XP <TrendingUp className="size-4" />
        </div>
        <div className="text-xs leading-none text-muted-foreground">
          Hiển thị tổng số điểm kinh nghiệm nhận được mỗi ngày
        </div>
      </CardFooter>
    </Card>
  )
}
