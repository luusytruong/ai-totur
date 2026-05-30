"use server"

import type {
  ApiResponse,
  CreateUserInput,
  UpdateUserInput,
  User,
} from "@workspace/types"
import { revalidatePath } from "next/cache"
import { apiServer } from "../api"

const USER_REVALIDATE_PATHS = ["/dashboard/users", "/dashboard"]

function revalidateUserPaths() {
  for (const path of USER_REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

export async function listUsers(): Promise<ApiResponse<User[]>> {
  try {
    return await apiServer.get<ApiResponse<User[]>>("/admin/users")
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      message: err.message || "Không thể tải danh sách tài khoản",
    }
  }
}

export async function getUser(id: number): Promise<ApiResponse<User>> {
  try {
    return await apiServer.get<ApiResponse<User>>(`/admin/users/${id}`)
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      message: err.message || "Không thể tải chi tiết tài khoản",
    }
  }
}

export async function createUser(
  data: CreateUserInput
): Promise<ApiResponse<User>> {
  try {
    const result = await apiServer.post<ApiResponse<User>>("/admin/users", {
      body: JSON.stringify(data),
    })

    if (result.success) {
      revalidateUserPaths()
    }

    return result
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      message: err.message || "Không thể tạo tài khoản",
    }
  }
}

export async function updateUser(
  id: number,
  data: UpdateUserInput
): Promise<ApiResponse<User>> {
  try {
    const result = await apiServer.patch<ApiResponse<User>>(
      `/admin/users/${id}`,
      {
        body: JSON.stringify(data),
      }
    )

    if (result.success) {
      revalidateUserPaths()
    }

    return result
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      message: err.message || "Không thể cập nhật tài khoản",
    }
  }
}

export async function deleteUser(id: number): Promise<ApiResponse<User>> {
  try {
    const result = await apiServer.delete<ApiResponse<User>>(
      `/admin/users/${id}`
    )

    if (result.success) {
      revalidateUserPaths()
    }

    return result
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      message: err.message || "Không thể xóa tài khoản",
    }
  }
}
