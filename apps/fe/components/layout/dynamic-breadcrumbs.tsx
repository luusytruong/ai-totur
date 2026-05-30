"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { apiClient } from "@/lib/api/apiClient"
import { useQuery } from "@tanstack/react-query"
import type {
  ConversationResponse,
  ExerciseDetailResponse,
  LessonDetailResponse,
} from "@workspace/types"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

/**
 * DynamicBreadcrumbs component generates breadcrumbs based on the current URL path.
 * It maps segments to human-readable Vietnamese labels and fetches dynamic titles
 * for chats, lessons, and exercises from the react-query cache or API.
 */
export function DynamicBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  const isLessonList = segments[0] === "lessons" && segments.length === 1
  const isLessonDetail = segments[0] === "lessons" && segments.length === 2
  const isExerciseList = segments[0] === "exercises" && segments.length === 1
  const isExerciseDetail = segments[0] === "exercises" && segments.length === 2
  const isNewChat = segments[0] === "new"
  const isChatDetail =
    segments.length === 1 &&
    !["lessons", "exercises", "new", "dashboard"].includes(segments[0])

  const lessonId = isLessonDetail ? segments[1] : null
  const exerciseId = isExerciseDetail ? segments[1] : null
  // chatId can be a UUID or a custom numeric ID depending on the route
  const chatId = isChatDetail ? segments[0] : null

  // Fetch names using useQuery. These keys match those used in the respective pages
  // so they will primarily hit the query cache.
  const { data: lessonRes } = useQuery<LessonDetailResponse>({
    queryKey: ["lesson", lessonId],
    queryFn: () => apiClient.get<LessonDetailResponse>(`/lessons/${lessonId}`),
    enabled: !!lessonId,
    staleTime: Infinity,
  })

  const { data: exerciseRes } = useQuery<ExerciseDetailResponse>({
    queryKey: ["exercise", exerciseId],
    queryFn: () =>
      apiClient.get<ExerciseDetailResponse>(`/exercises/${exerciseId}`),
    enabled: !!exerciseId,
    staleTime: Infinity,
  })

  const { data: chatRes } = useQuery<ConversationResponse>({
    queryKey: ["conversation", chatId],
    queryFn: () =>
      apiClient.get<ConversationResponse>(`/conversations/${chatId}`),
    enabled: !!chatId,
    staleTime: Infinity,
  })

  // Start with the Home breadcrumb
  const breadcrumbs = [{ label: "Trang chủ", href: "/" }]

  // Add contextual breadcrumbs
  if (isLessonList) {
    breadcrumbs.push({ label: "Danh sách bài học", href: "/lessons" })
  } else if (isLessonDetail) {
    breadcrumbs.push({ label: "Danh sách bài học", href: "/lessons" })
    if (lessonId && lessonRes?.data) {
      breadcrumbs.push({
        label: lessonRes.data.title,
        href: `/lessons/${lessonId}`,
      })
    } else if (lessonId) {
      breadcrumbs.push({ label: "Bài học...", href: `/lessons/${lessonId}` })
    }
  } else if (isExerciseList) {
    breadcrumbs.push({ label: "Danh sách bài tập", href: "/exercises" })
  } else if (isExerciseDetail) {
    breadcrumbs.push({ label: "Danh sách bài tập", href: "/exercises" })
    if (exerciseId && exerciseRes?.data) {
      breadcrumbs.push({
        label: exerciseRes.data.title,
        href: `/exercises/${exerciseId}`,
      })
    } else if (exerciseId) {
      breadcrumbs.push({
        label: "Bài tập...",
        href: `/exercises/${exerciseId}`,
      })
    }
  } else if (isNewChat) {
    breadcrumbs.push({ label: "Đoạn chat mới", href: "/new" })
  } else if (isChatDetail) {
    if (chatId && chatRes?.data) {
      breadcrumbs.push({ label: chatRes.data.title, href: `/${chatId}` })
    } else if (chatId) {
      breadcrumbs.push({ label: "Đoạn chat...", href: `/${chatId}` })
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage className="max-w-[150px] truncate font-semibold sm:max-w-[300px]">
                  {crumb.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
