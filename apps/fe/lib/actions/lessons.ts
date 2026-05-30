"use server"

import type {
  ApiResponse,
  CreateLessonInput,
  LessonRow,
  UpdateLessonInput,
} from "@workspace/types"
import { revalidatePath } from "next/cache"
import { apiServer } from "../api"

const LESSON_REVALIDATE_PATHS = ["/admin/lessons"]

function revalidateLessonPaths() {
  for (const path of LESSON_REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

export async function listLessonsAdmin(): Promise<ApiResponse<LessonRow[]>> {
  try {
    return await apiServer.get<ApiResponse<LessonRow[]>>("/admin/lessons")
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      message: err.message || "Không thể tải danh sách bài học",
    }
  }
}

export async function getLessonAdmin(
  id: number
): Promise<ApiResponse<LessonRow>> {
  try {
    return await apiServer.get<ApiResponse<LessonRow>>(`/admin/lessons/${id}`)
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      message: err.message || "Không thể tải chi tiết bài học",
    }
  }
}

export async function createLessonAdmin(
  data: CreateLessonInput
): Promise<ApiResponse<LessonRow>> {
  try {
    const result = await apiServer.post<ApiResponse<LessonRow>>(
      "/admin/lessons",
      {
        body: JSON.stringify(data),
      }
    )

    if (result.success) {
      revalidateLessonPaths()
    }

    return result
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      message: err.message || "Không thể tạo bài học",
    }
  }
}

export async function updateLessonAdmin(
  id: number,
  data: UpdateLessonInput
): Promise<ApiResponse<LessonRow>> {
  try {
    const result = await apiServer.patch<ApiResponse<LessonRow>>(
      `/admin/lessons/${id}`,
      {
        body: JSON.stringify(data),
      }
    )

    if (result.success) {
      revalidateLessonPaths()
    }

    return result
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      message: err.message || "Không thể cập nhật bài học",
    }
  }
}

export async function deleteLessonAdmin(
  id: number
): Promise<ApiResponse<LessonRow>> {
  try {
    const result = await apiServer.delete<ApiResponse<LessonRow>>(
      `/admin/lessons/${id}`
    )

    if (result.success) {
      revalidateLessonPaths()
    }

    return result
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      message: err.message || "Không thể xóa bài học",
    }
  }
}
