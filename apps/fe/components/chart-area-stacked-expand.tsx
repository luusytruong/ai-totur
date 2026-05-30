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

export const description = "A stacked area chart with expand stacking"

const chartData = [
  { day: "2024-04-01", desktop: 222, mobile: 150, other: 100, wtf: 110 },
  { day: "2024-04-02", desktop: 97, mobile: 180, other: 100, wtf: 110 },
  { day: "2024-04-03", desktop: 167, mobile: 120, other: 100, wtf: 110 },
  { day: "2024-04-04", desktop: 242, mobile: 260, other: 200, wtf: 210 },
  { day: "2024-04-05", desktop: 373, mobile: 290, other: 200, wtf: 210 },
  { day: "2024-04-06", desktop: 301, mobile: 340, other: 300, wtf: 310 },
  { day: "2024-04-07", desktop: 245, mobile: 180, other: 100, wtf: 110 },
  { day: "2024-04-08", desktop: 409, mobile: 320, other: 300, wtf: 310 },
  { day: "2024-04-09", desktop: 59, mobile: 110, other: 100, wtf: 110 },
  { day: "2024-04-10", desktop: 261, mobile: 190, other: 100, wtf: 110 },
  { day: "2024-04-11", desktop: 327, mobile: 350, other: 300, wtf: 310 },
  { day: "2024-04-12", desktop: 292, mobile: 210, other: 200, wtf: 210 },
  { day: "2024-04-13", desktop: 342, mobile: 380, other: 300, wtf: 310 },
  { day: "2024-04-14", desktop: 137, mobile: 220, other: 200, wtf: 210 },
  { day: "2024-04-15", desktop: 120, mobile: 170, other: 100, wtf: 110 },
  { day: "2024-04-16", desktop: 138, mobile: 190, other: 100, wtf: 110 },
  { day: "2024-04-17", desktop: 446, mobile: 360, other: 300, wtf: 310 },
  { day: "2024-04-18", desktop: 364, mobile: 410, other: 400, wtf: 410 },
  { day: "2024-04-19", desktop: 243, mobile: 180, other: 100, wtf: 110 },
  { day: "2024-04-20", desktop: 89, mobile: 150, other: 100, wtf: 110 },
  { day: "2024-04-21", desktop: 137, mobile: 200, other: 200, wtf: 210 },
  { day: "2024-04-22", desktop: 224, mobile: 170, other: 100, wtf: 110 },
  { day: "2024-04-23", desktop: 138, mobile: 230, other: 200, wtf: 210 },
  { day: "2024-04-24", desktop: 387, mobile: 290, other: 200, wtf: 210 },
  { day: "2024-04-25", desktop: 215, mobile: 250, other: 200, wtf: 210 },
  { day: "2024-04-26", desktop: 75, mobile: 130, other: 100, wtf: 110 },
  { day: "2024-04-27", desktop: 383, mobile: 420, other: 400, wtf: 410 },
  { day: "2024-04-28", desktop: 122, mobile: 180, other: 100, wtf: 110 },
  { day: "2024-04-29", desktop: 315, mobile: 240, other: 200, wtf: 210 },
  { day: "2024-04-30", desktop: 454, mobile: 380, other: 300, wtf: 310 },
  { day: "2024-05-01", desktop: 165, mobile: 220, other: 200, wtf: 210 },
  { day: "2024-05-02", desktop: 293, mobile: 310, other: 300, wtf: 310 },
  { day: "2024-05-03", desktop: 247, mobile: 190, other: 100, wtf: 110 },
  { day: "2024-05-04", desktop: 385, mobile: 420, other: 400, wtf: 410 },
  { day: "2024-05-05", desktop: 481, mobile: 390, other: 300, wtf: 310 },
  { day: "2024-05-06", desktop: 498, mobile: 520, other: 500, wtf: 510 },
  { day: "2024-05-07", desktop: 388, mobile: 300, other: 300, wtf: 310 },
  { day: "2024-05-08", desktop: 149, mobile: 210, other: 200, wtf: 210 },
  { day: "2024-05-09", desktop: 227, mobile: 180, other: 100, wtf: 110 },
  { day: "2024-05-10", desktop: 293, mobile: 330, other: 300, wtf: 310 },
  { day: "2024-05-11", desktop: 335, mobile: 270, other: 200, wtf: 210 },
  { day: "2024-05-12", desktop: 197, mobile: 240, other: 200, wtf: 210 },
  { day: "2024-05-13", desktop: 197, mobile: 160, other: 100, wtf: 110 },
  { day: "2024-05-14", desktop: 448, mobile: 490, other: 400, wtf: 410 },
  { day: "2024-05-15", desktop: 473, mobile: 380, other: 300, wtf: 310 },
  { day: "2024-05-16", desktop: 338, mobile: 400, other: 400, wtf: 410 },
  { day: "2024-05-17", desktop: 499, mobile: 420, other: 400, wtf: 410 },
  { day: "2024-05-18", desktop: 315, mobile: 350, other: 300, wtf: 310 },
  { day: "2024-05-19", desktop: 235, mobile: 180, other: 100, wtf: 110 },
  { day: "2024-05-20", desktop: 177, mobile: 230, other: 200, wtf: 210 },
  { day: "2024-05-21", desktop: 82, mobile: 140, other: 100, wtf: 110 },
  { day: "2024-05-22", desktop: 81, mobile: 120, other: 100, wtf: 110 },
  { day: "2024-05-23", desktop: 252, mobile: 290, other: 200, wtf: 210 },
  { day: "2024-05-24", desktop: 294, mobile: 220, other: 200, wtf: 210 },
  { day: "2024-05-25", desktop: 201, mobile: 250, other: 200, wtf: 210 },
  { day: "2024-05-26", desktop: 213, mobile: 170, other: 100, wtf: 110 },
  { day: "2024-05-27", desktop: 420, mobile: 460, other: 400, wtf: 410 },
  { day: "2024-05-28", desktop: 233, mobile: 190, other: 100, wtf: 110 },
  { day: "2024-05-29", desktop: 78, mobile: 130, other: 100, wtf: 110 },
  { day: "2024-05-30", desktop: 340, mobile: 280, other: 200, wtf: 210 },
  { day: "2024-05-31", desktop: 178, mobile: 230, other: 200, wtf: 210 },
  { day: "2024-06-01", desktop: 178, mobile: 200, other: 200, wtf: 210 },
  { day: "2024-06-02", desktop: 470, mobile: 410, other: 400, wtf: 410 },
  { day: "2024-06-03", desktop: 103, mobile: 160, other: 100, wtf: 110 },
  { day: "2024-06-04", desktop: 439, mobile: 380, other: 300, wtf: 310 },
  { day: "2024-06-05", desktop: 88, mobile: 140, other: 100, wtf: 110 },
  { day: "2024-06-06", desktop: 294, mobile: 250, other: 200, wtf: 210 },
  { day: "2024-06-07", desktop: 323, mobile: 370, other: 300, wtf: 310 },
  { day: "2024-06-08", desktop: 385, mobile: 320, other: 300, wtf: 310 },
  { day: "2024-06-09", desktop: 438, mobile: 480, other: 400, wtf: 410 },
  { day: "2024-06-10", desktop: 155, mobile: 200, other: 200, wtf: 210 },
  { day: "2024-06-11", desktop: 92, mobile: 150, other: 100, wtf: 110 },
  { day: "2024-06-12", desktop: 492, mobile: 420, other: 400, wtf: 410 },
  { day: "2024-06-13", desktop: 81, mobile: 130, other: 100, wtf: 110 },
  { day: "2024-06-14", desktop: 426, mobile: 380, other: 300, wtf: 310 },
  { day: "2024-06-15", desktop: 307, mobile: 350, other: 300, wtf: 310 },
  { day: "2024-06-16", desktop: 371, mobile: 310, other: 300, wtf: 310 },
  { day: "2024-06-17", desktop: 475, mobile: 520, other: 500, wtf: 510 },
  { day: "2024-06-18", desktop: 107, mobile: 170, other: 100, wtf: 110 },
  { day: "2024-06-19", desktop: 341, mobile: 290, other: 200, wtf: 210 },
  { day: "2024-06-20", desktop: 408, mobile: 450, other: 400, wtf: 410 },
  { day: "2024-06-21", desktop: 169, mobile: 210, other: 200, wtf: 210 },
  { day: "2024-06-22", desktop: 317, mobile: 270, other: 200, wtf: 210 },
  { day: "2024-06-23", desktop: 480, mobile: 530, other: 500, wtf: 510 },
  { day: "2024-06-24", desktop: 132, mobile: 180, other: 100, wtf: 110 },
  { day: "2024-06-25", desktop: 141, mobile: 190, other: 100, wtf: 110 },
  { day: "2024-06-26", desktop: 434, mobile: 380, other: 300, wtf: 310 },
  { day: "2024-06-27", desktop: 448, mobile: 490, other: 400, wtf: 410 },
  { day: "2024-06-28", desktop: 149, mobile: 200, other: 200, wtf: 210 },
  { day: "2024-06-29", desktop: 103, mobile: 160, other: 100, wtf: 110 },
  { day: "2024-06-30", desktop: 446, mobile: 400, other: 400, wtf: 410 },
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
  wtf: {
    label: "WTF",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function ChartAreaStackedExpand() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Area Chart - Stacked Expanded</CardTitle>
        <CardDescription>
          Showing total visitors for the last 6months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
            stackOffset="expand"
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) =>
                new Date(value).toLocaleDateString("vi-VN", {
                  day: "numeric",
                  year: "numeric",
                  month: "long",
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="wtf"
              type="natural"
              fill="var(--color-wtf)"
              fillOpacity={0.1}
              stroke="var(--color-wtf)"
              stackId="a"
            />
            <Area
              dataKey="other"
              type="natural"
              fill="var(--color-other)"
              fillOpacity={0.1}
              stroke="var(--color-other)"
              stackId="a"
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="var(--color-mobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
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
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
