"use client"

import { LanguageOnboardingDialog } from "@/components/lessons/language-onboarding-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useIsMobile } from "@/hooks/use-mobile"
import { apiClient } from "@/lib/api/apiClient"
import { cn } from "@/lib/utils"
import { mockStats } from "@/temp/mock/lessons"
import { useQuery } from "@tanstack/react-query"
import type {
  LessonListItem,
  LessonStatsResponse,
  LessonsResponse,
  ProfileResponse,
} from "@workspace/types"
import { ChevronRight, Play, Sparkles } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const DISPLAY_DIFFICULTY = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
}

const DISPLAY_LANGUAGE = {
  python: "Python",
  javascript: "JavaScript",
  cpp: "C++",
  java: "Java",
}

const DIFFICULTY_CLASS = {
  easy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  hard: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
}

/**
 * Strip markdown syntax and return first 2 non-empty lines joined by " — ".
 * Used for lesson card preview.
 */
function mdToPreview(md: string, maxLines = 2): string {
  const stripped = md
    .replace(/```[\s\S]*?```/g, "") // remove code blocks
    .replace(/`[^`]+`/g, "") // remove inline code
    .replace(/#{1,6}\s*/g, "") // remove headings
    .replace(/[*_~>]+/g, "") // remove bold/italic/blockquote
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // links → text
  const lines = stripped
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
  return lines.slice(0, maxLines).join(" — ")
}

const languages = [
  { id: "all", name: "Tất cả bài học" },
  { id: "python", name: "Python" },
  { id: "javascript", name: "JavaScript" },
  { id: "cpp", name: "C++" },
  { id: "java", name: "Java" },
]

export default function LessonsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [activeTab, setActiveTab] = useState<string>(
    searchParams.get("language") || "all"
  )
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [topic, setTopic] = useState(searchParams.get("topic") || "all")
  const [difficulty, setDifficulty] = useState(
    searchParams.get("difficulty") || "all"
  )
  const page = Number(searchParams.get("page")) || 1

  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all" || value === "") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    if (key !== "page") params.delete("page") // reset page on filter change
    router.push(`${pathname}?${params.toString()}`)
  }

  useEffect(() => {
    const delay = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (search) params.set("search", search)
      else params.delete("search")

      if (params.get("search") !== searchParams.get("search")) {
        params.delete("page")
        router.push(`${pathname}?${params.toString()}`)
      }
    }, 400)
    return () => clearTimeout(delay)
  }, [search, searchParams, pathname, router])

  const {
    data: lessonsData,
    isPending,
    isFetching,
  } = useQuery<LessonsResponse>({
    queryKey: [
      "lessons",
      activeTab,
      searchParams.get("search") || "",
      topic,
      difficulty,
      page,
    ],
    queryFn: () =>
      apiClient.get<LessonsResponse>("/lessons", {
        params: {
          language: activeTab,
          search: searchParams.get("search") || "",
          topic,
          difficulty,
          page: String(page),
        },
      }),
    placeholderData: (prev) => prev,
  })

  // Recommend request
  const { data: recommendRes } = useQuery<{
    data: {
      id: number
      title: string
      language: string
      topic: string
      difficulty: string
      contentMd?: string
    } | null
  }>({
    queryKey: ["lessons-recommend"],
    queryFn: () => apiClient.get("/lessons/recommend"),
    staleTime: 5 * 60 * 1000,
  })

  // Load profile để kiểm tra preferredLanguage
  const { data: profileRes } = useQuery<ProfileResponse>({
    queryKey: ["profile"],
    queryFn: () => apiClient.get<ProfileResponse>("/users/me"),
  })

  const showOnboarding =
    !!profileRes && !!profileRes.data && !profileRes.data.preferredLanguage

  const { data: statsData } = useQuery<LessonStatsResponse>({
    queryKey: ["lessons-stats"],
    queryFn: () => apiClient.get<LessonStatsResponse>("/lessons/stats"),
  })

  const { data: topicsData } = useQuery<{ data: string[] }>({
    queryKey: ["lessons-topics"],
    queryFn: () => apiClient.get<{ data: string[] }>("/lessons/topics"),
  })

  const isMobile = useIsMobile()
  const rawLessons: LessonListItem[] = Array.isArray(lessonsData?.data)
    ? (lessonsData?.data as LessonListItem[])
    : ((lessonsData?.data as { items?: LessonListItem[] })?.items ?? [])

  const meta = (
    lessonsData?.data as {
      meta?: { total: number; page: number; limit: number; totalPages: number }
    }
  )?.meta

  const recommendedLesson = recommendRes?.data
  const allLessons = [...rawLessons]

  if (recommendedLesson && page === 1) {
    // Only merge recommendation on page 1
    const idx = allLessons.findIndex((l) => l.id === recommendedLesson.id)
    if (idx >= 0) {
      allLessons[idx] = { ...allLessons[idx], isRecommended: true }
    } else {
      allLessons.unshift({
        id: recommendedLesson.id,
        title: recommendedLesson.title,
        language: recommendedLesson.language,
        topic: recommendedLesson.topic,
        difficulty: recommendedLesson.difficulty,
        contentMd: recommendedLesson.contentMd ?? "",
        isRecommended: true,
        stats: {
          totalExercises: 0,
          completedExercises: 0,
          isCompleted: false,
          isStarted: false,
          progress: 0,
        },
      } as LessonListItem)
    }
  }

  return (
    <div className="flex-1 animate-in p-4 duration-300 fade-in lg:p-6">
      <LanguageOnboardingDialog
        open={showOnboarding}
        onClose={(lang: string) => {
          setActiveTab(lang)
          updateUrl("language", lang)
        }}
      />
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Thư viện bài học</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Chọn ngôn ngữ và bắt đầu rèn luyện thuật toán, tư duy lập trình.
        </p>

        {isPending && !statsData ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          (statsData?.data ?? mockStats) && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <Card className="border-none">
                <CardContent>
                  <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                    Bài học
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {(statsData?.data ?? mockStats).completedLessons}/
                    {(statsData?.data ?? mockStats).totalLessons}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none">
                <CardContent>
                  <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                    Bài tập
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {(statsData?.data ?? mockStats).completedExercises}/
                    {(statsData?.data ?? mockStats).totalExercises}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none">
                <CardContent>
                  <p className="text-[10px] font-medium tracking-wider text-emerald-600 uppercase">
                    Tỉ lệ hoàn thành
                  </p>
                  <p className="mt-1 text-xl font-bold text-emerald-600">
                    {(statsData?.data ?? mockStats).totalLessons > 0
                      ? Math.round(
                          ((statsData?.data ?? mockStats).completedLessons /
                            (statsData?.data ?? mockStats).totalLessons) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none">
                <CardContent>
                  <p className="text-[10px] font-medium tracking-wider text-primary uppercase">
                    Trình độ
                  </p>
                  <p className="mt-1 text-xl font-bold uppercase">
                    {(statsData?.data ?? mockStats).completedLessons > 10
                      ? "Trung cấp"
                      : "Sơ cấp"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )
        )}

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex w-full flex-wrap gap-2 md:gap-4">
              <div className="relative w-full max-w-sm">
                <Input
                  type="text"
                  placeholder="Tìm kiếm bài học..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  // className="h-10 w-full rounded-full border bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              <Select
                value={topic}
                onValueChange={(v) => {
                  setTopic(v)
                  updateUrl("topic", v)
                }}
              >
                <SelectTrigger className="h-9 w-32.5 rounded-full">
                  <SelectValue placeholder="Chủ đề" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả chủ đề</SelectItem>
                  {topicsData?.data.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={difficulty}
                onValueChange={(v) => {
                  setDifficulty(v)
                  updateUrl("difficulty", v)
                }}
              >
                <SelectTrigger className="h-9 w-32.5 rounded-full md:mr-auto">
                  <SelectValue placeholder="Độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Mọi cấp độ</SelectItem>
                  <SelectItem value="easy">Dễ</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="hard">Khó</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex justify-end">
                {isMobile ? (
                  <Select
                    value={activeTab}
                    onValueChange={(v) => {
                      if (v) {
                        setActiveTab(v)
                        updateUrl("language", v)
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 rounded-full">
                      <SelectValue placeholder="Chọn ngôn ngữ" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={activeTab}
                    onValueChange={(v) => {
                      if (v) {
                        setActiveTab(v)
                        updateUrl("language", v)
                      }
                    }}
                    className="justify-start gap-1"
                  >
                    {languages.map((lang) => (
                      <ToggleGroupItem
                        key={lang.id}
                        value={lang.id}
                        className="h-9 rounded-full px-4 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      >
                        {lang.name}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div
        className={cn(
          "transition-opacity duration-300",
          isFetching && !isPending ? "opacity-50" : "opacity-100"
        )}
      >
        {isPending && allLessons.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        ) : allLessons.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allLessons.map((lesson) => {
              const isRecommended = lesson.isRecommended

              return (
                <Link
                  href={`/lessons/${lesson.id}`}
                  key={lesson.id}
                  className="group block h-full"
                >
                  <Card
                    className={cn(
                      "relative flex h-full flex-col transition-all duration-300",
                      isRecommended
                        ? "border-primary/50 shadow-md ring-1 ring-primary/20 hover:-translate-y-1 hover:shadow-lg hover:ring-primary/40"
                        : "hover:-translate-y-1 hover:shadow-md"
                    )}
                  >
                    <CardHeader className="gap-3">
                      {/* Row 1: difficulty badge + progress/lock */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {isRecommended && (
                            <Badge variant="default">
                              <Sparkles className="size-3" />
                              Đề xuất
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold tracking-wider uppercase",
                              DIFFICULTY_CLASS[
                                lesson.difficulty as keyof typeof DIFFICULTY_CLASS
                              ]
                            )}
                          >
                            {
                              DISPLAY_DIFFICULTY[
                                lesson.difficulty as keyof typeof DISPLAY_DIFFICULTY
                              ]
                            }
                          </Badge>
                        </div>

                        <div className="relative -mt-2 flex h-10 w-10 items-center justify-center">
                          <svg
                            className="absolute inset-0 h-full w-full -rotate-90"
                            viewBox="0 0 36 36"
                          >
                            <circle
                              cx="18"
                              cy="18"
                              r="15.9"
                              fill="transparent"
                              stroke="currentColor"
                              strokeWidth="3"
                              className="text-muted"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="15.9"
                              fill="transparent"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeDasharray={`${lesson.stats.progress}, 100`}
                              className={cn(
                                "transition-all duration-500",
                                isRecommended
                                  ? "text-primary"
                                  : "text-emerald-500"
                              )}
                            />
                          </svg>
                          <span
                            className={cn(
                              "relative z-10 text-xs font-bold",
                              isRecommended &&
                                lesson.stats.progress === 0 &&
                                "text-primary"
                            )}
                          >
                            {lesson.stats.progress}
                          </span>
                        </div>
                      </div>

                      {/* Row 2: title */}
                      <CardTitle className="line-clamp-2 text-base leading-snug">
                        {lesson.title}
                      </CardTitle>

                      {/* Row 2.5: preview text */}
                      {lesson.contentMd && (
                        <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                          {mdToPreview(lesson.contentMd)}
                        </p>
                      )}

                      {/* Row 3: tags */}
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className="text-[10px]">
                          {
                            DISPLAY_LANGUAGE[
                              lesson.language as keyof typeof DISPLAY_LANGUAGE
                            ]
                          }
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {lesson.topic}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="mt-auto pt-0">
                      <Button
                        variant={
                          isRecommended
                            ? "default"
                            : lesson.stats.isStarted || lesson.stats.isCompleted
                              ? "secondary"
                              : "outline"
                        }
                        className="w-full gap-2"
                      >
                        {lesson.stats.isCompleted ? (
                          <>
                            Xem lại <ChevronRight className="size-4" />
                          </>
                        ) : lesson.stats.isStarted ? (
                          <>
                            Tiếp tục <ChevronRight className="size-4" />
                          </>
                        ) : (
                          <>
                            Bắt đầu học{" "}
                            <Play className="size-4" fill="currentColor" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card className="border-dashed py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Chưa có bài học nào trong danh mục này.
            </p>
          </Card>
        )}
      </div>

      {/* Pagination component */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={meta.page <= 1}
            onClick={() => updateUrl("page", String(meta.page - 1))}
          >
            Trang trước
          </Button>
          <div className="flex items-center text-sm font-medium">
            Trang {meta.page} / {meta.totalPages}
          </div>
          <Button
            variant="outline"
            disabled={meta.page >= meta.totalPages}
            onClick={() => updateUrl("page", String(meta.page + 1))}
          >
            Trang tiếp
          </Button>
        </div>
      )}
    </div>
  )
}
