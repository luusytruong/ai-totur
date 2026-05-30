import type { ApiResponse } from "@workspace/types"
import { redirect } from "next/navigation"

import { User } from "@workspace/types/db"
import { apiServer } from "./api"

import { cache } from "react"

export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    const result = await apiServer.get<ApiResponse<User>>("/users/me")
    return result.success && result.data ? result.data : null
  } catch {
    // console.error("getCurrentUser error:", error)
    return null
  }
})

export async function requireCurrentUser(callbackUrl?: string): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    // Xóa cookie để proxy không bị redirect loop
    try {
      const { cookies } = await import("next/headers")
      const store = await cookies()
      store.delete("access_token")
      store.delete("refresh_token")
    } catch {
      // ignore nếu không có cookies store
    }

    const loginPath = callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login"
    redirect(loginPath)
  }

  return user
}

export async function requireAdminUser(callbackUrl?: string): Promise<User> {
  const user = await requireCurrentUser(callbackUrl)

  if (user.role !== "admin") {
    // redirect("/")
    throw new Error("Bạn không có quyền truy cập")
  }

  return user
}
