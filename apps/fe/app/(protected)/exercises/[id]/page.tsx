"use client"

import Message from "@/components/chat/message"
import { MiniChat } from "@/components/chat/mini-chat"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Item } from "@/components/ui/item"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiClient } from "@/lib/api/apiClient"
import { mockExercises } from "@/temp/mock/lessons"
import { Editor } from "@monaco-editor/react"
import { useMutation, useQuery } from "@tanstack/react-query"
import type {
  ExerciseDetailResponse,
  ExerciseSubmitResponse,
  ExerciseWithLesson,
  LessonRecommendationResponse,
} from "@workspace/types"
import {
  AlertCircle,
  BotMessageSquare,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDot,
  DollarSign,
  Lightbulb,
  Play,
  TerminalSquare,
  XCircle,
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

type SupportedLanguage = "python" | "javascript" | "cpp" | "java"

function resolveExerciseLanguage(language?: string | null): SupportedLanguage {
  if (language === "python") return "python"
  if (language === "cpp" || language === "java") return language
  return "javascript"
}

function resolveExerciseFilename(language: SupportedLanguage): string {
  if (language === "python") return "main.py"
  if (language === "java") return "Main.java"
  if (language === "cpp") return "main.cpp"
  return "main.js"
}

function resolveExerciseLabel(language: SupportedLanguage): string {
  if (language === "python") return "Python"
  if (language === "java") return "Java"
  if (language === "cpp") return "C++"
  return "JavaScript"
}

export default function ExercisePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const exerciseId = params.id

  const [code, setCode] = useState("")
  const [activeTab, setActiveTab] = useState("content")
  const [autoPrompt, setAutoPrompt] = useState<string | null>(null)
  const [autoAskAi, setAutoAskAi] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(true)
  const resultRef = useRef<HTMLDivElement>(null)

  const {
    data: exerciseResponse,
    isPending,
    isError,
  } = useQuery<ExerciseDetailResponse>({
    queryKey: ["exercise", exerciseId],
    queryFn: () =>
      apiClient.get<ExerciseDetailResponse>(`/exercises/${exerciseId}`),
    enabled: Boolean(exerciseId),
  })

  const fallbackExercise =
    mockExercises.find(
      (mockExercise) => String(mockExercise.id) === String(exerciseId)
    ) ?? mockExercises[0]
  const exercise: ExerciseWithLesson | undefined =
    exerciseResponse?.data ?? fallbackExercise

  if (isError && !exerciseResponse?.data) {
    console.warn("Exercise API error — falling back to mock data")
  }

  const initialCode = useMemo(() => {
    if (!exercise?.starterCode) {
      return "function solve(nums, target) {\n  return []\n}\n"
    }
    return exercise.starterCode
  }, [exercise?.starterCode])

  const starterCodeSource = exerciseResponse?.data
    ? `api:${exerciseResponse.data.id}`
    : `fallback:${exerciseId}`
  const lastHydratedSource = useRef<string | null>(null)
  useEffect(() => {
    if (initialCode && lastHydratedSource.current !== starterCodeSource) {
      setCode(initialCode)
      lastHydratedSource.current = starterCodeSource
    }
  }, [initialCode, starterCodeSource])

  const submitMutation = useMutation<ExerciseSubmitResponse, Error, string>({
    mutationFn: (submitCode) =>
      apiClient.post<ExerciseSubmitResponse>(
        `/exercises/${exerciseId}/submit`,
        {
          body: JSON.stringify({ code: submitCode }),
        }
      ),
    onSuccess: (res) => {
      setTerminalOpen(true)
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 100)
      // Nếu submit sai → chuyển sang tab AI kèm prompt lỗi tự động
      const result = res.data?.result
      if (result?.status === "fail" || result?.status === "error") {
        if (autoAskAi) {
          const prompt = "Hãy giúp tôi phân tích và sửa lỗi trong code."
          setAutoPrompt(prompt)
          setActiveTab("chat")
        }
      } else if (result?.status === "pass") {
        const nextLesson = res.data?.nextLessonSuggestion
        const currentLessonHref = `/lessons/${exercise.lesson?.id ?? exerciseId}`
        if (nextLesson) {
          toast.success("Chúc mừng bạn đã hoàn thành bài học.", {
            description:
              "Ấn vào đây để làm bài tiếp theo, hoặc quay về bài học.",
            action: {
              label: "Làm bài tiếp theo",
              onClick: () => router.push(`/lessons/${nextLesson.id}`),
            },
            cancel: {
              label: "Quay về bài học",
              onClick: () => router.push(currentLessonHref),
            },
          })
        } else {
          toast.success("Chúc mừng bạn đã hoàn thành bài học.", {
            description: "Bài làm đã được ghi nhận.",
            cancel: {
              label: "Quay về bài học",
              onClick: () => router.push(currentLessonHref),
            },
          })

          if (exercise.lesson?.id && res.data?.shouldFetchNextLessonSuggestion) {
            void apiClient
              .get<LessonRecommendationResponse>(
                `/lessons/${exercise.lesson.id}/next`
              )
              .then((recommendationRes) => {
                const recommendedLesson = recommendationRes.data
                if (!recommendedLesson) return

                toast.success("Đã tìm thấy bài học tiếp theo.", {
                  description:
                    recommendedLesson.reason ?? "Dựa trên tiến độ hiện tại của bạn.",
                  action: {
                    label: "Mở bài học",
                    onClick: () => router.push(`/lessons/${recommendedLesson.id}`),
                  },
                })
              })
              .catch(() => {
                // Gợi ý bài tiếp theo không được chặn luồng nộp bài thành công.
              })
          }
        }
      }
    },
    onError: (error) => {
      toast.error(error.message || "Nộp bài thất bại")
    },
  })

  if (isPending) {
    return (
      <div className="flex h-full w-full">
        <div className="w-120 shrink-0 space-y-5 border-r p-5">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-16 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="w-full flex-1" />
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-sm text-destructive">Không thể tải bài tập.</div>
      </div>
    )
  }

  const submitResponse = submitMutation.data?.data
  const submitData = submitResponse?.result
  const isPass = submitData?.status === "pass"
  const lang = resolveExerciseLanguage(exercise.lesson?.language)
  const filename = resolveExerciseFilename(lang)

  return (
    <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[480px_1fr]">
      {/* ── Sidebar ── */}
      <aside className="flex h-full flex-col overflow-hidden border-b bg-background lg:border-r lg:border-b-0">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex h-full flex-col gap-0"
        >
          {/* Tab bar chuẩn — line indicator */}
          <div className="shrink-0 bg-muted/30">
            <TabsList className="h-11! w-full justify-start gap-0 rounded-none bg-transparent p-0">
              <TabsTrigger
                value="content"
                className="h-full gap-1.5 rounded-none border-b-2 border-transparent bg-muted px-5 text-xs font-medium text-muted-foreground transition-none data-[state=active]:border-primary data-[state=active]:bg-background! data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                <CircleDot className="size-3.5" />
                Đề bài
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="h-full gap-1.5 rounded-none border-b-2 border-transparent bg-muted px-5 text-xs font-medium text-muted-foreground transition-none data-[state=active]:border-primary data-[state=active]:bg-background! data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                <BotMessageSquare className="size-3.5" />
                Gia sư AI
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="content"
            className="m-0 flex-1 overflow-y-auto p-5 data-[state=inactive]:hidden"
            forceMount
          >
            <h1 className="mb-1.5 text-base font-bold">{exercise.title}</h1>
            <Message content={exercise.description} variant="sm" />

            <Separator className="my-5" />

            <div className="space-y-5">
              <div>
                <h3 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Kết quả mong đợi
                </h3>
                <Item variant="muted" className="font-mono text-xs">
                  {exercise.expectedOutput}
                </Item>
              </div>

              {exercise.testCases.length > 0 && (
                <div>
                  <h3 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Test Cases
                  </h3>
                  <div className="space-y-3">
                    {exercise.testCases.map((tc, index) => (
                      <Item
                        key={index}
                        className="flex-col items-start gap-0 font-mono text-xs"
                        variant="outline"
                      >
                        <p className="mb-1.5 font-semibold text-muted-foreground">
                          Case {index + 1}
                        </p>
                        <p>
                          <span className="text-muted-foreground">in: </span>
                          <span className="text-foreground">
                            {tc.input.startsWith("[") && tc.input.endsWith("]")
                              ? tc.input.slice(1, -1)
                              : tc.input}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">out: </span>
                          <span className="text-emerald-500">
                            {tc.expected}
                          </span>
                        </p>
                      </Item>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="chat"
            className="m-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
            forceMount
          >
            <MiniChat
              currentCode={code}
              exerciseId={Number(exercise.id)}
              lastError={
                submitData?.errorMsg ||
                (submitData?.failedCaseIndex != null
                  ? `Sai ở testcase ${submitData.failedCaseIndex + 1}`
                  : null)
              }
              autoStartPrompt={autoPrompt}
              onAutoStartClear={() => setAutoPrompt(null)}
            />
          </TabsContent>
        </Tabs>
      </aside>

      {/* ── Editor + Terminal ── */}
      <section className="flex min-h-0 min-w-0 flex-col bg-background">
        {/* Editor toolbar – VS Code style */}
        <div className="flex h-11 shrink-0 items-center justify-between bg-muted px-3 py-1.5">
          {/* file tab */}
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <span
                className={`inline-block size-2 rounded-full text-[10px] ${lang === "python" ? "bg-blue-500" : "bg-yellow-500"}`}
              />
              {filename}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
              <Label
                htmlFor="auto-ai"
                className="cursor-pointer text-[10px] whitespace-nowrap"
              >
                Tự động hỏi AI khi sai
              </Label>
              <Switch
                id="auto-ai"
                size="sm"
                checked={autoAskAi}
                onCheckedChange={setAutoAskAi}
              />
            </div>

            <Badge variant="outline" className="text-[10px]">
              {resolveExerciseLabel(lang)}
            </Badge>
            <Button
              size="sm"
              disabled={submitMutation.isPending}
              onClick={() => submitMutation.mutate(code)}
              className="h-7 gap-1.5 bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-500"
            >
              {submitMutation.isPending ? (
                <span className="flex items-center gap-1">
                  <span className="size-2 animate-pulse rounded-full bg-white" />
                  Đang chấm...
                </span>
              ) : (
                <>
                  <Play className="size-3 fill-current" />
                  Nộp bài
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage={lang}
            theme={resolvedTheme === "light" ? "vs-light" : "vs-dark"}
            value={code}
            onChange={(value) => setCode(value ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              renderLineHighlight: "all",
              fontFamily: "var(--font-mono)",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
              padding: { top: 12, bottom: 12 },
              cursorBlinking: "smooth",
              smoothScrolling: true,
            }}
          />
        </div>

        {/* ── Terminal panel ── */}
        <div
          className="shrink-0 border-t border-border/60 bg-muted/60"
          ref={resultRef}
        >
          {/* Terminal header bar */}
          <button
            onClick={() => setTerminalOpen((v) => !v)}
            className="flex w-full items-center gap-2 border-b border-border/10 bg-background px-3 py-1.5 text-left hover:bg-border/5"
          >
            <TerminalSquare className="size-3.5" strokeWidth={1.5} />
            <span className="text-xs font-medium">Terminal</span>
            <div className="ml-auto">
              {terminalOpen ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronUp className="size-3.5" />
              )}
            </div>
          </button>

          {terminalOpen && (
            <div className="max-h-56 overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed">
              {/* Trạng thái chờ */}
              {!submitData && !submitMutation.isPending && (
                <p className="">
                  <span className="text-emerald-500">$</span> Nhấn{" "}
                  <span className="">Nộp bài</span> để chạy code và kiểm tra kết
                  quả...
                </p>
              )}

              {/* Đang chạy */}
              {submitMutation.isPending && (
                <p className="animate-pulse text-amber-500">
                  <span className="">$</span> Đang chạy test cases...
                </p>
              )}

              {/* Kết quả */}
              {submitData && submitResponse && (
                <div className="space-y-1">
                  <p className="text-green-600">
                    <DollarSign className="mr-1 inline size-3" />
                    {filename}
                  </p>

                  {/* Hint */}
                  {submitResponse.action === "hint" && submitResponse.hint && (
                    <p className="mt-1 text-amber-500">
                      <Lightbulb className="mr-1 inline size-3" />
                      Gợi ý: {submitResponse.hint}
                    </p>
                  )}

                  {/* Reroute */}
                  {submitResponse.action === "reroute" &&
                    submitResponse.suggestedLessonId && (
                      <span className="flex items-center gap-2">
                        <AlertCircle className="size-3 text-red-500" />
                        <span className="text-red-500">
                          Hệ thống gợi ý ôn lý thuyết trước.
                        </span>
                        <Link
                          href={`/lessons/${submitResponse.suggestedLessonId}`}
                          className="text-blue-500 underline underline-offset-2"
                        >
                          → Xem bài học
                        </Link>
                      </span>
                    )}

                  {/* Pass */}
                  {isPass && (
                    <p className="text-emerald-500">
                      <CheckCircle2 className="mr-1 inline size-3" />
                      Tất cả test cases đều đúng! Thời gian:{" "}
                      {submitData.runtimeMs}ms
                    </p>
                  )}

                  {/* Fail */}
                  {!isPass && (
                    <>
                      <p className="text-red-500">
                        <XCircle className="mr-1 inline size-3" />
                        {submitData.failedCaseIndex != null
                          ? `Test case #${submitData.failedCaseIndex + 1} thất bại.`
                          : "Nộp bài thất bại."}{" "}
                        Thời gian: {submitData.runtimeMs}ms
                      </p>
                      {submitData.errorMsg && (
                        <pre className="mt-1 whitespace-pre-wrap text-red-500">
                          {submitData.errorMsg}
                        </pre>
                      )}
                      <p className="mt-1">
                        Tip: Mở tab{" "}
                        <span className="text-blue-500">Gia sư AI</span> để được
                        hỗ trợ phân tích lỗi.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
