"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api/apiClient"
import { useQuery } from "@tanstack/react-query"
import type { LessonListItem, LessonsResponse } from "@workspace/types"
import { BookOpen, ChevronRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function SuggestedLessons() {
  const { data: lessonsRes, isPending } = useQuery<LessonsResponse>({
    queryKey: ["suggested-lessons"],
    queryFn: () => apiClient.get<LessonsResponse>("/lessons"),
  })

  // Ưu tiên bài isRecommended, fallback lấy 3 bài đầu
  const rawLessons: LessonListItem[] = Array.isArray(lessonsRes?.data)
    ? (lessonsRes?.data as LessonListItem[])
    : (lessonsRes?.data?.items ?? [])

  const recommended = rawLessons.filter((l) => l.isRecommended)
  const suggestedLessons = (
    recommended.length > 0 ? recommended : rawLessons
  ).slice(0, 3)

  if (isPending) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold">Bài học gợi ý</CardTitle>
          <Skeleton className="h-4 w-16" />
        </CardHeader>
        <CardContent>
          <ItemGroup className="gap-2.5">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </ItemGroup>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-primary" />
          Bài học gợi ý
        </CardTitle>
        <Link
          href="/lessons"
          className="flex items-center gap-0.5 text-xs text-primary hover:underline"
        >
          Tất cả <ChevronRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        {suggestedLessons.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Chưa có gợi ý mới
          </div>
        )}
        <ItemGroup className="gap-2.5">
          {suggestedLessons.map((lesson) => (
            <Item key={lesson.id} variant="muted" size="sm" asChild>
              <Link href={`/lessons/${lesson.id}`} className="justify-between">
                <ItemMedia variant="icon" className="text-primary">
                  <BookOpen strokeWidth={1.5} className="size-4" />
                </ItemMedia>
                <ItemContent className="min-w-0 gap-1">
                  <ItemTitle className="w-full text-sm leading-tight font-semibold">
                    <span className="truncate">{lesson.title}</span>
                  </ItemTitle>
                  <ItemDescription className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="h-5 px-1.5 py-0 text-[10px]"
                    >
                      {lesson.language}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="h-5 px-1.5 py-0 text-[10px]"
                    >
                      {lesson.topic}
                    </Badge>
                  </ItemDescription>
                </ItemContent>
                <ItemMedia variant="icon" className="text-muted-foreground">
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-xs font-semibold text-foreground tabular-nums">
                      {lesson.stats.progress}%
                    </span>
                    <ChevronRight className="size-3.5 transition-transform group-hover/item:translate-x-0.5" />
                  </div>
                </ItemMedia>
              </Link>
            </Item>
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  )
}
