"use client"

import Message from "@/components/chat/message"
import { TableOfContents } from "@/components/lessons/toc"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api/apiClient"
import { useQuery } from "@tanstack/react-query"
import type {
  ApiResponse,
  LessonRecommendationResponse,
} from "@workspace/types"
import { ExerciseRow, LessonRow } from "@workspace/types/db"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Code2,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

type LessonDetail = LessonRow & {
  exercises: (ExerciseRow & { isCompleted?: boolean })[]
}

const DIFFICULTY_CLASS = {
  easy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none",
  hard: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-none",
}

const DIFFICULTY_LABEL = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
}

const LANGUAGE_LABEL: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  cpp: "C++",
  java: "Java",
}

export default function LessonDetailPage() {
  const params = useParams<{ id: string }>()
  const lessonId = params.id

  const { data, isPending, isError } = useQuery<ApiResponse<LessonDetail>>({
    queryKey: ["lesson", lessonId],
    queryFn: () =>
      apiClient.get<ApiResponse<LessonDetail>>(`/lessons/${lessonId}`),
  })

  const lesson = data?.data
  const completedCount =
    lesson?.exercises.filter((e) => e.isCompleted).length ?? 0
  const progress =
    lesson?.exercises.length && lesson.exercises.length > 0
      ? Math.round((completedCount / lesson.exercises.length) * 100)
      : 0

  const isLessonCompleted =
    !!lesson &&
    lesson.exercises.length > 0 &&
    completedCount === lesson.exercises.length

  const { data: nextLessonResponse, isPending: isNextLessonPending } =
    useQuery<LessonRecommendationResponse>({
      queryKey: ["lesson-next", lessonId],
      queryFn: () =>
        apiClient.get<LessonRecommendationResponse>(
          `/lessons/${lessonId}/next`
        ),
      enabled: isLessonCompleted,
    })

  const nextLesson = nextLessonResponse?.data ?? null
  const nextExercise = lesson?.exercises.find((e) => !e.isCompleted) ?? null
  const nextLessonHref = nextLesson ? `/lessons/${nextLesson.id}` : "/lessons"
  const nextExerciseHref = nextExercise
    ? `/exercises/${nextExercise.id}`
    : "/lessons"
  const nextCardHref = isLessonCompleted ? nextLessonHref : nextExerciseHref
  const nextCardLabel = isLessonCompleted ? "Bài tiếp theo" : "Tiếp theo"

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-8 px-6 py-10">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-8 pb-6">
            <AlertCircle className="mx-auto mb-3 size-8 text-destructive" />
            <CardTitle className="mb-2 text-base">Không tìm thấy</CardTitle>
            <p className="mb-5 text-sm text-muted-foreground">
              Không thể lấy nội dung bài học.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/lessons">Quay lại danh sách</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!lesson) {
    return null
  }

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      {/* ── Main content ── */}
      <main className="min-w-0 flex-1 border-r px-4 py-6 pt-4 lg:px-6 lg:py-6">
        <div className="mx-auto h-full max-w-3xl">
          {/* ── Hero ── */}
          <div className="mb-8">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Badge
                className={
                  DIFFICULTY_CLASS[
                    lesson.difficulty as keyof typeof DIFFICULTY_CLASS
                  ]
                }
              >
                {
                  DIFFICULTY_LABEL[
                    lesson.difficulty as keyof typeof DIFFICULTY_LABEL
                  ]
                }
              </Badge>
              <Badge variant="secondary">
                {LANGUAGE_LABEL[lesson.language] ?? lesson.language}
              </Badge>
              <Badge variant="outline">{lesson.topic}</Badge>
            </div>

            <div className="flex flex-col gap-6">
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                {lesson.title}
              </h1>
              {isLessonCompleted ? (
                isNextLessonPending ? (
                  <Button
                    size="lg"
                    disabled
                    className="shrink-0 rounded-full px-7 shadow-md sm:w-fit"
                  >
                    Đang gợi ý bài tiếp theo...
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    className="shrink-0 rounded-full px-7 shadow-md sm:w-fit"
                  >
                    <Link href={nextCardHref}>
                      {nextCardLabel}
                      <ChevronRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                )
              ) : (
                nextExercise && (
                  <Button
                    asChild
                    size="lg"
                    className="shrink-0 rounded-full px-7 shadow-md sm:w-fit"
                  >
                    <Link href={nextExerciseHref}>
                      {completedCount > 0
                        ? "Tiếp tục bài tập"
                        : "Bắt đầu bài tập"}
                      <ChevronRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                )
              )}
            </div>
          </div>

          {/* ── Article body ── */}
          <article>
            <Message
              content={
                lesson.contentMd ||
                "Chưa có nội dung lý thuyết cho bài học này."
              }
              className="prose prose-sm max-w-none dark:prose-invert"
            />
          </article>

          {/* ── Exercises Section (Mobile/Tablet only) ── */}
          <div className="mt-12 block lg:hidden">
            <SectionHeader icon={Code2} title="Bài tập thực hành" />
            <ExerciseList exercises={lesson.exercises} />
          </div>

          {/* ── Prev / Next navigation ── */}
          <div className="mt-16 grid grid-cols-1 gap-4 border-t pt-8 sm:grid-cols-2">
            <Link
              href="/lessons"
              className="group flex flex-col gap-1 rounded-2xl bg-muted/40 p-5 transition-colors hover:bg-muted"
            >
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Quay lại
              </span>
              <div className="flex items-center gap-2">
                <ArrowLeft className="size-4 text-primary transition-transform group-hover:-translate-x-1" />
                <span className="text-sm font-semibold sm:text-base">
                  Thư viện bài học
                </span>
              </div>
            </Link>

            {isLessonCompleted ? (
              isNextLessonPending ? (
                <div className="rounded-2xl bg-muted/40 p-5">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    Bài tiếp theo
                  </span>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Đang gợi ý bài học phù hợp với hồ sơ học tập của bạn...
                  </p>
                </div>
              ) : nextLesson ? (
                <Link
                  href={nextLessonHref}
                  className="group flex flex-col items-end gap-1 rounded-2xl bg-muted/40 p-5 transition-colors hover:bg-muted"
                >
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    Bài tiếp theo
                  </span>
                  <div className="flex items-center gap-2 text-right">
                    <span className="line-clamp-1 text-sm font-semibold sm:text-base">
                      {nextLesson.title}
                    </span>
                    <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ) : null
            ) : (
              nextExercise && (
                <Link
                  href={nextExerciseHref}
                  className="group flex flex-col items-end gap-1 rounded-2xl bg-muted/40 p-5 transition-colors hover:bg-muted"
                >
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    Tiếp theo
                  </span>
                  <div className="flex items-center gap-2 text-right">
                    <span className="line-clamp-1 text-sm font-semibold sm:text-base">
                      {nextExercise.title}
                    </span>
                    <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </main>

      {/* ── Right sidebar (Desktop only) ── */}
      <aside className="hidden w-72 shrink-0 lg:block xl:w-80">
        <div className="sticky top-0 flex flex-col gap-8 overflow-y-auto px-6 py-4 pb-10 md:max-h-[calc(100svh-4rem)]">
          {/* Table of contents (Hidden on small desktops/md) */}
          <div className="hidden xl:block">
            <SectionHeader title="Mục lục" />
            <TableOfContents content={lesson.contentMd || ""} />
          </div>

          {/* Progress widget */}
          {lesson.exercises.length > 0 && (
            <div className="rounded-2xl bg-muted/40 p-5 shadow-sm ring-1 ring-border/50">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold">Tiến độ bài học</span>
                <span className="font-mono text-xs font-bold text-primary">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="mb-3 h-2" />
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                Hoàn thành{" "}
                <span className="font-bold text-foreground">
                  {completedCount}/{lesson.exercises.length}
                </span>{" "}
                bài tập.
              </p>
            </div>
          )}

          {/* Exercise list */}
          <div>
            <SectionHeader icon={Code2} title="Bài tập thực hành" />
            <ExerciseList exercises={lesson.exercises} />
          </div>

          {/* Tip */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <h4 className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-amber-600 uppercase">
              <Zap className="size-3" /> Tip học tập
            </h4>
            <p className="text-[11px] leading-relaxed text-amber-700/80 dark:text-amber-400/80">
              Đừng ngại hỏi AI Tutor nếu bạn gặp khó khăn trong khi làm bài tập!
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon?: React.ElementType
  title: string
}) {
  return (
    <h3 className="mb-4 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
      {Icon && <Icon className="size-3.5 text-primary" />}
      {title}
    </h3>
  )
}

function ExerciseList({
  exercises,
}: {
  exercises: (ExerciseRow & { isCompleted?: boolean })[]
}) {
  if (exercises.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">
        Đang cập nhật bài tập...
      </p>
    )
  }

  return (
    <div className="space-y-1.5">
      {exercises.map((ex, i) => (
        <Link
          key={ex.id}
          href={`/exercises/${ex.id}`}
          className="group flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-muted"
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-background text-[10px] font-bold shadow-sm transition-colors group-hover:border-primary/50">
            {ex.isCompleted ? (
              <CheckCircle2 className="size-3.5 text-emerald-500" />
            ) : (
              i + 1
            )}
          </div>
          <span className="line-clamp-1 text-sm font-medium text-foreground/80 transition-colors group-hover:text-primary">
            {ex.title}
          </span>
          <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary/50" />
        </Link>
      ))}
    </div>
  )
}
