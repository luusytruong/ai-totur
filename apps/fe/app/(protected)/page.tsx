"use client"

import { ProgressLineChart } from "@/components/dashboard/progress-line-chart"
import { RecentChat } from "@/components/dashboard/recent-chat"
import { SkillsInsights } from "@/components/dashboard/skills-insights"
import { SkillsPie } from "@/components/dashboard/skills-pie"
import { StreakCalendar } from "@/components/dashboard/streak-calendar"
import { SubmittedExercisesTable } from "@/components/dashboard/submitted-exercises"
import { SuggestedLessons } from "@/components/dashboard/suggested-lessons"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api/apiClient"
import { useQuery } from "@tanstack/react-query"
import type { UserAnalyticsResponse } from "@workspace/types"
import { BookOpen, GraduationCap, Sparkles, Target, Zap } from "lucide-react"

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Sơ cấp",
  intermediate: "Trung cấp",
  advanced: "Cao cấp",
}

const LEVEL_COLOR: Record<string, string> = {
  beginner: "text-sky-500",
  intermediate: "text-amber-500",
  advanced: "text-purple-500",
}

export default function Dashboard() {
  const { data: analyticsRes, isPending } = useQuery<UserAnalyticsResponse>({
    queryKey: ["analytics"],
    queryFn: () => apiClient.get<UserAnalyticsResponse>("/analytics/me"),
  })

  const statsData = analyticsRes?.data
  const user = statsData?.analytics?.user
  const level = user?.level ?? "beginner"

  /* ─── Skeleton ─── */
  if (isPending) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Skeleton className="h-72 lg:col-span-4" />
          <Skeleton className="h-72 lg:col-span-5" />
          <Skeleton className="h-72 lg:col-span-3" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: "Bài đạt",
      value: statsData?.submissionStats.passed?.toString() ?? "0",
      icon: GraduationCap,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Tổng nộp",
      value: statsData?.submissionStats.total?.toString() ?? "0",
      icon: Target,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Tỉ lệ đúng",
      value: `${statsData?.submissionStats.passRate ?? 0}%`,
      icon: Sparkles,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Bài đang học",
      value: statsData?.submissionStats.total?.toString() ?? "0",
      icon: BookOpen,
      color: LEVEL_COLOR[level] ?? "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ]

  return (
    <div className="flex flex-1 animate-in flex-col gap-6 p-4 duration-500 fade-in lg:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Chào mừng trở lại, {user?.displayName ?? "Bạn"}! 👋
          </h1>
          <Badge
            variant="outline"
            className={`hidden sm:flex ${LEVEL_COLOR[level] ?? ""}`}
          >
            <Zap className="mr-1 size-3" />
            {LEVEL_LABEL[level] ?? "Sơ cấp"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Hôm nay bạn muốn rèn luyện kỹ năng nào?
        </p>
      </div>

      {/* ── Metric Strip ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none bg-card shadow-xs">
            <CardContent className="flex items-center gap-3">
              <div className={`rounded-xl p-2 ${stat.bg}`}>
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                  {stat.label}
                </span>
                <span className="text-xl font-bold tabular-nums">
                  {stat.value}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Col A – Streak + Gợi ý */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <StreakCalendar data={statsData?.activity} />
          <SuggestedLessons />
        </div>

        {/* Col B – Pie kỹ năng + Line chart XP */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <SkillsPie data={statsData?.analytics} />
          <SkillsInsights data={statsData?.analytics} />
          <ProgressLineChart data={statsData?.xpHistory} />
        </div>

        {/* Col C – Lịch sử chat AI */}
        <div className="lg:col-span-3">
          <RecentChat />
        </div>
      </div>

      {/* ── Submitted Exercises Table ── */}
      <div className="mt-2">
        <SubmittedExercisesTable />
      </div>
    </div>
  )
}
