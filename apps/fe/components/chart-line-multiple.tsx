"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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

export const description = "A multiple line chart"

const chartData = [
  { month: "January", desktop: 186, mobile: 80, other: 85, other2: 89 },
  { month: "February", desktop: 305, mobile: 200, other: 205, other2: 209 },
  { month: "March", desktop: 237, mobile: 120, other: 125, other2: 129 },
  { month: "April", desktop: 73, mobile: 190, other: 195, other2: 199 },
  { month: "May", desktop: 209, mobile: 130, other: 135, other2: 139 },
  { month: "June", desktop: 214, mobile: 140, other: 145, other2: 149 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
  other: {
    label: "Other",
    color: "var(--chart-3)",
  },
  other2: {
    label: "Other 2",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function ChartLineMultiple() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Chart - Multiple</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="desktop"
              type="bump"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
              fill="var(--color-desktop)"
              fillOpacity={0.1}
              stackId="a"
            />
            <Area
              dataKey="mobile"
              type="bump"
              stroke="var(--color-mobile)"
              strokeWidth={2}
              dot={false}
              fill="var(--color-mobile)"
              fillOpacity={0.1}
              stackId="a"
            />
            <Area
              dataKey="other"
              type="bump"
              stroke="var(--color-other)"
              strokeWidth={2}
              dot={false}
              fill="var(--color-other)"
              fillOpacity={0.1}
              stackId="a"
            />
            <Area
              dataKey="other2"
              type="bump"
              stroke="var(--color-other2)"
              strokeWidth={2}
              dot={false}
              fill="var(--color-other2)"
              fillOpacity={0.1}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing total visitors for the last 6 months
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
