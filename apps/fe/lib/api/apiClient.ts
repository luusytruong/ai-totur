import type { RefreshTokenResponse } from "@workspace/types"
import {
  ApiMethods,
  buildHeaders,
  buildUrl,
  parseResponse,
  type FetchOptions,
} from "./core"
import { withRetry } from "./retry"

// ─── Token cache + queue ───────────────────────────────────────────────────────

let cachedToken: string | null = null
let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string | null) => void
  reject: (err: unknown) => void
}> = []

function flushQueue(error: unknown, token: string | null = null) {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  pendingQueue = []
}

export function getClientToken() {
  return cachedToken
}

export function setClientToken(token: string | null) {
  cachedToken = token
}

// ─── Token helpers ────────────────────────────────────────────────────────────

function getRefreshTokenFromCookie(): string | null {
  const entry = document.cookie
    .split("; ")
    .find((c) => c.startsWith("refresh_token="))
  if (!entry) return null
  // Dùng indexOf để tránh bị cắt sai khi value chứa '='
  return decodeURIComponent(entry.slice(entry.indexOf("=") + 1))
}

async function refreshClientToken(
  failedToken: string | null = null
): Promise<string | null> {
  // Nếu đã có token mới hơn cái vừa fail, dùng luôn không cần refresh tiếp
  if (cachedToken && cachedToken !== failedToken) {
    return cachedToken
  }

  // Nếu đang refresh rồi thì xếp hàng chờ
  if (isRefreshing) {
    return new Promise<string | null>((resolve, reject) => {
      pendingQueue.push({ resolve, reject })
    })
  }

  isRefreshing = true

  try {
    const { API_BASE_URL } = await import("./core")
    const refreshToken = getRefreshTokenFromCookie()

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (refreshToken) {
      headers["Authorization"] = `Bearer ${refreshToken}`
    }

    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
      credentials: "include",
    })

    if (res.status === 429) {
      isRefreshing = false
      flushQueue(null, null)
      return null
    }

    if (!res.ok) throw new Error("Refresh token thất bại")

    const result = (await res.json().catch(() => ({}))) as RefreshTokenResponse
    const newToken = result.data?.accessToken ?? null

    if (!newToken)
      throw new Error(result.message ?? "Không nhận được access token mới")

    cachedToken = newToken
    flushQueue(null, newToken)
    return newToken
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    flushQueue(err)
    cachedToken = null
    // Chỉ redirect nếu không phải lỗi 429
    if (err?.status !== 429) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
    }
    throw err
  } finally {
    isRefreshing = false
  }
}

// ─── apiClient ────────────────────────────────────────────────────────────────

async function apiClientBase<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, headers: extraHeaders, ...rest } = options
  const url = buildUrl(endpoint, params)

  // Nếu đang refresh hệ thống ở chỗ khác, đợi xong rồi mới bắt đầu request này
  // để tránh việc bắn 1 request không có token rồi lại dính 401 và retry vô ích.
  if (isRefreshing) {
    await new Promise<string | null>((resolve, reject) => {
      pendingQueue.push({ resolve, reject })
    })
  }

  let currentAttemptToken = cachedToken

  const execute = async (retryToken: string | null): Promise<Response> => {
    currentAttemptToken = retryToken ?? cachedToken
    return fetch(url, {
      ...rest,
      headers: buildHeaders(currentAttemptToken, rest.body, extraHeaders),
      credentials: "include",
    })
  }

  const response = await withRetry(execute, {
    endpoint,
    onUnauthorized: () => refreshClientToken(currentAttemptToken),
  })

  return parseResponse<T>(response)
}

type ApiClientFn = ApiMethods & typeof apiClientBase

/**
 * Fetch wrapper dành cho browser (Client Components, event handlers).
 * - Dùng in-memory token cache
 * - Queue các request đang chờ khi refresh token đang chạy
 * - Retry 1 lần sau khi refresh thành công
 */
export const apiClient = Object.assign(apiClientBase, {
  get: (endpoint: string, options?: FetchOptions) =>
    apiClientBase(endpoint, { ...options, method: "GET" }),
  post: (endpoint: string, options?: FetchOptions) =>
    apiClientBase(endpoint, { ...options, method: "POST" }),
  put: (endpoint: string, options?: FetchOptions) =>
    apiClientBase(endpoint, { ...options, method: "PUT" }),
  delete: (endpoint: string, options?: FetchOptions) =>
    apiClientBase(endpoint, {
      ...options,
      method: "DELETE",
      body: JSON.stringify({}),
    }),
  patch: (endpoint: string, options?: FetchOptions) =>
    apiClientBase(endpoint, { ...options, method: "PATCH" }),
}) as ApiClientFn
