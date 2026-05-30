"use server"

import type {
  ApiResponse,
  ChangeInfoInput,
  ForgotPasswordInput,
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
  ResetPasswordInput,
} from "@workspace/types"
import { User } from "@workspace/types/db"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { apiServer } from "../api"

/**
 * Các server actions trả về ApiResponse để component xử lý đồng nhất
 */

export async function login(data: LoginInput): Promise<ApiResponse<unknown>> {
  try {
    const result = await apiServer.post<LoginResponse>("/auth/login", {
      body: JSON.stringify(data),
    })

    if (result.success && result.data) {
      const { accessToken, refreshToken } = result.data
      await setCookies(accessToken, refreshToken)
    }

    return result
  } catch (error: unknown) {
    const err = error as Error
    return { success: false, message: err.message || "Đăng nhập thất bại" }
  }
}

export async function register(
  data: RegisterInput
): Promise<ApiResponse<unknown>> {
  try {
    const result = await apiServer.post<RegisterResponse>("/auth/register", {
      body: JSON.stringify(data),
    })

    if (result.success && result.data) {
      const { accessToken, refreshToken } = result.data
      await setCookies(accessToken, refreshToken)
    }

    return result
  } catch (error: unknown) {
    const err = error as Error
    return { success: false, message: err.message || "Đăng ký thất bại" }
  }
}

export async function forgotPassword(
  data: ForgotPasswordInput
): Promise<ApiResponse<unknown>> {
  try {
    return await apiServer.post<ApiResponse<unknown>>("/auth/forgot-password", {
      body: JSON.stringify(data),
    })
  } catch (error: unknown) {
    const err = error as Error
    return {
      success: false,
      message: err.message || "Gửi link đặt lại mật khẩu thất bại",
    }
  }
}

export async function resetPassword(
  data: ResetPasswordInput
): Promise<ApiResponse<unknown>> {
  try {
    return await apiServer.post<ApiResponse<unknown>>("/auth/reset-password", {
      body: JSON.stringify(data),
    })
  } catch (error: unknown) {
    const err = error as Error
    return {
      success: false,
      message: err.message || "Đặt lại mật khẩu thất bại",
    }
  }
}

export async function changeInfo(
  data: ChangeInfoInput
): Promise<ApiResponse<User>> {
  try {
    return await apiServer.patch<ApiResponse<User>>("/users/me", {
      body: JSON.stringify(data),
    })
  } catch (error: unknown) {
    const err = error as Error
    return {
      success: false,
      message: err.message || "Cập nhật thông tin thất bại",
    }
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("access_token")
  cookieStore.delete("refresh_token")
  redirect("/login")
}

async function setCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies()

  cookieStore.set("access_token", accessToken, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 24 hours
  })

  cookieStore.set("refresh_token", refreshToken, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}
