"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { UserAnalyticsData } from "@workspace/types"
import { TrendingDown, TrendingUp } from "lucide-react"
import { useMemo } from "react"

export function SkillsInsights({
  data,
}: {
  data?: UserAnalyticsData["analytics"] | null
}) {
  const strengths = useMemo(() => {
    if (!data?.knownTopics || data.knownTopics.length === 0) return ["Chưa có"]
    return data.knownTopics.slice(0, 2)
  }, [data])

  const weaknesses = useMemo(() => {
    if (!data?.errorPatterns) return ["Chưa có"]
    const sortedErrors = Object.entries(data.errorPatterns)
      .sort((a, b) => b[1] - a[1])
      .map(([key]) => key)
    return sortedErrors.length > 0 ? sortedErrors.slice(0, 2) : ["Chưa có"]
  }, [data])

  return (
    <div className="grid w-full grid-cols-2 gap-3">
      <Card className="border-none bg-emerald-500/10 shadow-none">
        <CardContent className="flex flex-col items-center justify-center">
          <span className="mb-0.5 flex items-center gap-1 text-xs font-bold tracking-wider text-emerald-600/70 uppercase">
            <TrendingUp className="size-3" /> Điểm mạnh
          </span>
          <span className="text-xs font-bold text-emerald-600 capitalize">
            {strengths.join(", ")}
          </span>
        </CardContent>
      </Card>
      <Card className="border-none bg-rose-500/10 shadow-none">
        <CardContent className="flex flex-col items-center justify-center">
          <span className="mb-0.5 flex items-center gap-1 text-xs font-bold tracking-wider text-rose-600/70 uppercase">
            <TrendingDown className="size-3" /> Điểm yếu
          </span>
          <span className="text-xs font-bold text-rose-600 capitalize">
            {weaknesses.join(", ")}
          </span>
        </CardContent>
      </Card>
    </div>
  )
}
