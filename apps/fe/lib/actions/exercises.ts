"use server"

import type {
  ApiResponse,
  CreateExerciseInput,
  ExerciseRow,
  UpdateExerciseInput,
} from "@workspace/types"
import { revalidatePath } from "next/cache"
import { apiServer } from "../api"

const EXERCISE_REVALIDATE_PATHS = ["/admin/exercises", "/admin/lessons"]

function revalidateExercisePaths() {
  for (const path of EXERCISE_REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

export async function listExercisesAdmin(
  lessonId?: number
): Promise<ApiResponse<ExerciseRow[]>> {
  try {
    const qs = lessonId ? `?lessonId=${lessonId}` : ""
    return await apiServer.get<ApiResponse<ExerciseRow[]>>(
      `/admin/exercises${qs}`
    )
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      message: err.message || "Không thể tải danh sách bài tập",
    }
  }
}

export async function getExerciseAdmin(
  id: number
): Promise<ApiResponse<ExerciseRow>> {
  try {
    return await apiServer.get<ApiResponse<ExerciseRow>>(
      `/admin/exercises/${id}`
    )
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      message: err.message || "Không thể tải chi tiết bài tập",
    }
  }
}

export async function createExerciseAdmin(
  data: CreateExerciseInput
): Promise<ApiResponse<ExerciseRow>> {
  try {
    const result = await apiServer.post<ApiResponse<ExerciseRow>>(
      "/admin/exercises",
      {
        body: JSON.stringify(data),
      }
    )

    if (result.success) {
      revalidateExercisePaths()
    }

    return result
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      message: err.message || "Không thể tạo bài tập",
    }
  }
}

export async function updateExerciseAdmin(
  id: number,
  data: UpdateExerciseInput
): Promise<ApiResponse<ExerciseRow>> {
  try {
    const result = await apiServer.patch<ApiResponse<ExerciseRow>>(
      `/admin/exercises/${id}`,
      {
        body: JSON.stringify(data),
      }
    )

    if (result.success) {
      revalidateExercisePaths()
    }

    return result
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      message: err.message || "Không thể cập nhật bài tập",
    }
  }
}

export async function deleteExerciseAdmin(
  id: number
): Promise<ApiResponse<ExerciseRow>> {
  try {
    const result = await apiServer.delete<ApiResponse<ExerciseRow>>(
      `/admin/exercises/${id}`
    )

    if (result.success) {
      revalidateExercisePaths()
    }

    return result
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      message: err.message || "Không thể xóa bài tập",
    }
  }
}
