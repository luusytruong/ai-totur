"use client"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useIsMobile } from "@/hooks/use-mobile"
import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

interface DailyStat {
  date: string
  user: number
  assistant: number
}

export interface DailySubmissions {
  date: string
  success: number
  failed: number
}

interface DashboardChartsProps {
  dailyMessages?: DailyStat[]
  dailySubmissions?: DailySubmissions[]
}

export function DashboardCharts({
  dailyMessages = [],
  dailySubmissions = [],
}: DashboardChartsProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeout(() => setTimeRange("7d"), 0)
    }
  }, [isMobile])

  const days = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30

  const filteredSubmissions = React.useMemo(
    () => dailySubmissions.slice(-days),
    [dailySubmissions, days]
  )

  const filteredMessages = React.useMemo(
    () => dailyMessages.slice(-days),
    [dailyMessages, days]
  )

  const timeRangeLabel =
    timeRange === "7d"
      ? "7 ngày qua"
      : timeRange === "30d"
        ? "30 ngày qua"
        : "90 ngày qua"

  // Chart 1: Submissions (pass vs fail) — giống format AreaChart của temp/fe
  const submissionConfig = {
    success: { label: "Thành công (AC)", color: "var(--chart-2)" },
    failed: { label: "Thất bại", color: "var(--chart-1)" },
  } satisfies ChartConfig

  // Chart 2: User vs AI messages
  const messageConfig = {
    user: { label: "Câu hỏi User", color: "var(--chart-1)" },
    assistant: { label: "Phản hồi AI", color: "var(--chart-2)" },
  } satisfies ChartConfig

  // Shared time range controls
  const TimeRangeControls = (
    <>
      <ToggleGroup
        type="single"
        value={timeRange}
        onValueChange={(val: string) => val && setTimeRange(val)}
        variant="outline"
        className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
      >
        <ToggleGroupItem value="90d">90 ngày</ToggleGroupItem>
        <ToggleGroupItem value="30d">30 ngày</ToggleGroupItem>
        <ToggleGroupItem value="7d">7 ngày</ToggleGroupItem>
      </ToggleGroup>
      <Select value={timeRange} onValueChange={setTimeRange}>
        <SelectTrigger
          className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
          size="sm"
          aria-label="Chọn khoảng thời gian"
        >
          <SelectValue placeholder="30 ngày qua" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="90d" className="rounded-lg">
            90 ngày qua
          </SelectItem>
          <SelectItem value="30d" className="rounded-lg">
            30 ngày qua
          </SelectItem>
          <SelectItem value="7d" className="rounded-lg">
            7 ngày qua
          </SelectItem>
        </SelectContent>
      </Select>
    </>
  )

  return (
    <div className="flex flex-col gap-4">
      {/* ── Chart 1: Lượt Submit Code ─────────────────────────────────── */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Lượt Nộp Code (Submissions)</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Thống kê lượt nộp mã nguồn thành công và thất bại —{" "}
              {timeRangeLabel}
            </span>
            <span className="@[540px]/card:hidden">{timeRangeLabel}</span>
          </CardDescription>
          <CardAction>{TimeRangeControls}</CardAction>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={submissionConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredSubmissions}>
              <defs>
                <linearGradient id="fillSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-success)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-success)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-failed)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-failed)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(v: string | number | boolean | Date) =>
                  new Date(String(v)).toLocaleDateString("vi-VN", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="w-52"
                    labelFormatter={(v: React.ReactNode) =>
                      new Date(String(v)).toLocaleDateString("vi-VN", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="success"
                type="bump"
                fill="url(#fillSuccess)"
                stroke="var(--color-success)"
                stackId="a"
              />
              <Area
                dataKey="failed"
                type="bump"
                fill="url(#fillFailed)"
                stroke="var(--color-failed)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ── Chart 2: Tương tác User vs AI ────────────────────────────────── */}
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Tương tác Người dùng & AI</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Số câu hỏi của User và phản hồi của AI — {timeRangeLabel}
            </span>
            <span className="@[540px]/card:hidden">{timeRangeLabel}</span>
          </CardDescription>
          <CardAction>{TimeRangeControls}</CardAction>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={messageConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredMessages}>
              <defs>
                <linearGradient id="fillUser" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-user)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-user)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillAssistant" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-assistant)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-assistant)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(v: string | number | boolean | Date) =>
                  new Date(String(v)).toLocaleDateString("vi-VN", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="w-52"
                    labelFormatter={(v: React.ReactNode) =>
                      new Date(String(v)).toLocaleDateString("vi-VN", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="user"
                type="bump"
                fill="url(#fillUser)"
                stroke="var(--color-user)"
                stackId="a"
              />
              <Area
                dataKey="assistant"
                type="bump"
                fill="url(#fillAssistant)"
                stroke="var(--color-assistant)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
