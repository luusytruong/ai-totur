"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api/apiClient"
import { cn, formatRelativeTime } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import type {
  ConversationsResponse,
  LessonListItem,
  LessonsResponse,
  UserAnalyticsResponse,
  UserProgressResponse,
} from "@workspace/types"
import {
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  Clock3,
  Flame,
  GraduationCap,
  MessageSquarePlus,
  Route,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { Item, ItemActions, ItemContent, ItemMedia } from "../ui/item"

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Sơ cấp",
  intermediate: "Trung cấp",
  advanced: "Cao cấp",
}

const LEVEL_TONE: Record<string, string> = {
  beginner: "border-sky-500/30 bg-sky-500/10 text-sky-600",
  intermediate: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  advanced: "border-violet-500/30 bg-violet-500/10 text-violet-600",
}

function formatDayLabel(date: string) {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  })
}

function resolveLessonHref(lesson?: LessonListItem) {
  if (!lesson) return "/lessons"
  return `/lessons/${lesson.id}`
}

function DashboardV2Skeleton() {
  return (
    <div className="flex flex-1 flex-col gap-5 p-4 lg:p-6">
      <Skeleton className="h-36 w-full rounded-4xl" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-28 rounded-4xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <Skeleton className="h-96 rounded-4xl" />
        <Skeleton className="h-96 rounded-4xl" />
      </div>
    </div>
  )
}

export function UserDashboardV2() {
  const { data: analyticsRes, isPending: isAnalyticsPending } =
    useQuery<UserAnalyticsResponse>({
      queryKey: ["dashboard-v2", "analytics"],
      queryFn: () => apiClient.get<UserAnalyticsResponse>("/analytics/me"),
    })

  const { data: lessonsRes, isPending: isLessonsPending } =
    useQuery<LessonsResponse>({
      queryKey: ["dashboard-v2", "lessons"],
      queryFn: () =>
        apiClient.get<LessonsResponse>("/lessons", {
          params: { limit: "1000", page: "1" },
        }),
    })

  const { data: progressRes } = useQuery<UserProgressResponse>({
    queryKey: ["dashboard-v2", "progress"],
    queryFn: () => apiClient.get<UserProgressResponse>("/progress/me"),
  })

  const { data: conversationsRes } = useQuery<ConversationsResponse>({
    queryKey: ["dashboard-v2", "conversations"],
    queryFn: () => apiClient.get<ConversationsResponse>("/conversations"),
  })

  const analytics = analyticsRes?.data
  const user = analytics?.analytics?.user
  const level = user?.level ?? "beginner"
  const lessons: LessonListItem[] = useMemo(() => {
    return Array.isArray(lessonsRes?.data)
      ? (lessonsRes.data as LessonListItem[])
      : (lessonsRes?.data?.items ?? [])
  }, [lessonsRes])

  const progressItems = useMemo(() => progressRes?.data ?? [], [progressRes])
  const conversations = useMemo(
    () => conversationsRes?.data?.slice(0, 3) ?? [],
    [conversationsRes]
  )

  const lessonSummary = useMemo(() => {
    const completed = lessons.filter(
      (lesson) => lesson.stats.isCompleted
    ).length
    const started = lessons.filter((lesson) => lesson.stats.isStarted).length
    const active =
      lessons
        .filter((lesson) => lesson.stats.isStarted && !lesson.stats.isCompleted)
        .sort((a, b) => b.stats.progress - a.stats.progress)[0] ?? null
    const suggested =
      lessons.find(
        (lesson) => lesson.isRecommended && !lesson.stats.isCompleted
      ) ??
      lessons.find((lesson) => !lesson.stats.isCompleted) ??
      null

    return {
      total: lessons.length,
      completed,
      started,
      active,
      suggested,
      percent:
        lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0,
    }
  }, [lessons])

  const recentProgress = useMemo(() => {
    return [...progressItems]
      .filter((item) => item.exerciseId)
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, 6)
  }, [progressItems])

  const activityBars = useMemo(() => {
    const rows = analytics?.activity ?? []
    const max = Math.max(...rows.map((row) => Number(row.count)), 1)

    return rows.slice(-7).map((row) => ({
      ...row,
      label: formatDayLabel(row.date),
      height: Math.max(18, Math.round((Number(row.count) / max) * 96)),
    }))
  }, [analytics?.activity])

  const totalSubmissions = analytics?.submissionStats.total ?? 0
  const passedSubmissions = analytics?.submissionStats.passed ?? 0
  const failedSubmissions = analytics?.submissionStats.failed ?? 0
  const passRate = analytics?.submissionStats.passRate ?? 0
  const avgRuntimeMs = analytics?.submissionStats.avgRuntimeMs

  if (isAnalyticsPending || isLessonsPending) {
    return <DashboardV2Skeleton />
  }

  const focusLesson = lessonSummary.active ?? lessonSummary.suggested
  const focusHref = resolveLessonHref(focusLesson ?? undefined)

  const metrics = [
    {
      label: "Bài đạt",
      value: passedSubmissions,
      detail: `${totalSubmissions} lượt nộp`,
      icon: CheckCircle2,
      tone: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Tỉ lệ đúng",
      value: `${passRate}%`,
      detail: `${failedSubmissions} lần cần sửa`,
      icon: Target,
      tone: "text-sky-600",
      bg: "bg-sky-500/10",
    },
    {
      label: "Lộ trình",
      value: `${lessonSummary.completed}/${lessonSummary.total}`,
      detail: `${lessonSummary.started} bài đã bắt đầu`,
      icon: Route,
      tone: "text-violet-600",
      bg: "bg-violet-500/10",
    },
    {
      label: "Runtime TB",
      value: avgRuntimeMs ? `${avgRuntimeMs}ms` : "Chưa có",
      detail: "Từ bài nộp gần đây",
      icon: Clock3,
      tone: "text-amber-600",
      bg: "bg-amber-500/10",
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-5 bg-background p-4 lg:p-6">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-4xl border bg-card p-5 shadow-xs lg:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn("h-7 gap-1.5", LEVEL_TONE[level])}
                >
                  <GraduationCap className="size-3.5" />
                  {LEVEL_LABEL[level] ?? "Sơ cấp"}
                </Badge>
                <Badge variant="outline" className="h-7 gap-1.5">
                  <Flame className="size-3.5 text-orange-600" />
                  {activityBars.length} ngày có hoạt động
                </Badge>
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
                  Xin chào, {user?.displayName ?? "bạn"}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Tập trung vào bài đang học, kiểm tra tiến độ và quay lại luyện
                  tập nhanh hơn.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild className="gap-2">
                <Link href={focusHref}>
                  Tiếp tục học
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/new">
                  <MessageSquarePlus className="size-4" />
                  Hỏi AI
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Trophy className="size-4 text-amber-600" />
              Tổng quan lộ trình
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-semibold tabular-nums">
                  {lessonSummary.percent}%
                </div>
                <p className="text-xs text-muted-foreground">
                  bài học đã hoàn thành
                </p>
              </div>
              <Badge variant="secondary">
                {lessonSummary.completed}/{lessonSummary.total}
              </Badge>
            </div>
            <Progress value={lessonSummary.percent} className="h-2" />
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="shadow-xs">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={cn("rounded-md p-2", metric.bg)}>
                <metric.icon className={cn("size-5", metric.tone)} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  {metric.label}
                </p>
                <p className="truncate text-xl font-semibold tabular-nums">
                  {metric.value}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {metric.detail}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BookOpen className="size-4 text-sky-600" />
              Trọng tâm hiện tại
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5">
              <Link href="/lessons">
                Xem tất cả
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {focusLesson ? (
              <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
                <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold">
                        {focusLesson.title}
                      </h2>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline">{focusLesson.language}</Badge>
                        <Badge variant="outline">{focusLesson.topic}</Badge>
                        <Badge variant="outline">
                          {focusLesson.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <Badge className="bg-emerald-600 text-white">
                      {focusLesson.stats.progress}%
                    </Badge>
                  </div>
                  <Progress
                    value={focusLesson.stats.progress}
                    className="h-2"
                  />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Bài tập</p>
                      <p className="text-base font-semibold tabular-nums">
                        {focusLesson.stats.completedExercises}/
                        {focusLesson.stats.totalExercises}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Trạng thái
                      </p>
                      <p className="text-base font-semibold">
                        {focusLesson.stats.isStarted ? "Đang học" : "Sẵn sàng"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bước tiếp</p>
                      <Link
                        href={focusHref}
                        className="inline-flex items-center gap-1 text-base font-semibold text-primary hover:underline"
                      >
                        Mở bài
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-violet-600" />
                    <p className="text-sm font-semibold">Gợi ý học nhanh</p>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Ưu tiên hoàn thành các bài còn thiếu trong lesson này trước
                    khi mở chủ đề mới.
                  </p>
                  <Separator />
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      Mục tiêu gần nhất
                    </span>
                    <span className="font-medium">
                      {Math.max(
                        focusLesson.stats.totalExercises -
                          focusLesson.stats.completedExercises,
                        0
                      )}{" "}
                      bài còn lại
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-muted/20 p-6 text-center">
                <BookOpen className="size-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Chưa có bài học để tiếp tục
                </p>
                <Button asChild size="sm">
                  <Link href="/lessons">Mở danh sách bài học</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="size-4 text-emerald-600" />
              Nhịp học 7 ngày
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityBars.length > 0 ? (
              <div className="flex h-44 items-end gap-2">
                {activityBars.map((item) => (
                  <div
                    key={`${item.date}-${item.count}`}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                  >
                    <div className="flex h-28 w-full items-end rounded-md bg-muted/40 px-1">
                      <div
                        className="w-full rounded-sm bg-emerald-500"
                        style={{ height: item.height }}
                      />
                    </div>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-44 items-center justify-center rounded-md border border-dashed bg-muted/20 px-6 text-center text-sm text-muted-foreground">
                Hoàn thành bài tập để tạo biểu đồ hoạt động.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Bài tập gần đây
            </CardTitle>
            <Badge variant="outline">{recentProgress.length} mục</Badge>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[310px] pr-3">
              <div className="space-y-2">
                {recentProgress.length === 0 && (
                  <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                    Chưa có bài tập đã ghi nhận.
                  </div>
                )}
                {recentProgress.map((item) => (
                  <Item key={item.id} variant="outline">
                    <ItemMedia className="rounded-md bg-emerald-500/10 p-2 text-emerald-600">
                      <CheckCircle2 className="size-4" />
                    </ItemMedia>
                    <ItemContent className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.exercise?.title ?? "Bài tập"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.lesson?.title ?? "Không rõ bài học"}
                      </p>
                    </ItemContent>
                    <Badge
                      variant={
                        item.completionStatus === "completed"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {item.score ?? 0} XP
                    </Badge>
                  </Item>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bot className="size-4 text-violet-600" />
              AI Tutor gần đây
            </CardTitle>
            <Button asChild variant="ghost" size="xs" className="h-6 gap-1.5">
              <Link href="/new">
                Cuộc trò chuyện mới
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {conversations.length === 0 && (
              <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                Chưa có lịch sử trò chuyện.
              </div>
            )}
            {conversations.map((conversation) => (
              <Item key={conversation.id} asChild variant="outline">
                <Link
                  href={`/${conversation.id}`}
                  className="transition-colors hover:bg-muted/20"
                >
                  <ItemMedia className="rounded-md bg-violet-500/10 p-2 text-violet-600">
                    <Bot className="size-4" />
                  </ItemMedia>
                  <ItemContent className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(new Date(conversation.updatedAt))}
                    </p>
                  </ItemContent>
                  <ItemActions>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </ItemActions>
                </Link>
              </Item>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
