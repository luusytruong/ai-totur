import type { RefreshTokenResponse } from "@workspace/types"
import {
  ApiMethods,
  buildHeaders,
  buildUrl,
  parseResponse,
  type FetchOptions,
} from "./core"
import { withRetry } from "./retry"

// ─── Token helpers ────────────────────────────────────────────────────────────

async function getServerTokens(): Promise<{
  accessToken: string | null
  refreshToken: string | null
}> {
  try {
    const { cookies } = await import("next/headers")
    const store = await cookies()
    return {
      accessToken: store.get("access_token")?.value ?? null,
      refreshToken: store.get("refresh_token")?.value ?? null,
    }
  } catch {
    return { accessToken: null, refreshToken: null }
  }
}

async function refreshServerToken(
  refreshToken: string | null
): Promise<string | null> {
  const { API_BASE_URL } = await import("./core")

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (refreshToken) {
    headers["Authorization"] = `Bearer ${refreshToken}`
  }

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
    credentials: "include",
    cache: "no-store",
  })

  if (res.status === 429 || !res.ok) return null

  const result = (await res.json().catch(() => ({}))) as RefreshTokenResponse
  return result.data?.accessToken ?? null
}

// ─── apiServer ────────────────────────────────────────────────────────────────

async function apiServerBase<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, headers: extraHeaders, ...rest } = options
  const url = buildUrl(endpoint, params)
  const { accessToken, refreshToken } = await getServerTokens()

  const execute = async (retryToken: string | null): Promise<Response> => {
    const token = retryToken ?? accessToken
    // console.log(`[Server API] ${rest.method || "GET"} ${endpoint}`)
    return fetch(url, {
      ...rest,
      headers: buildHeaders(token, rest.body, extraHeaders),
      credentials: "include",
      cache: "no-store",
    })
  }

  const response = await withRetry(execute, {
    endpoint,
    onUnauthorized: () => refreshServerToken(refreshToken),
  })

  return parseResponse<T>(response)
}

type ApiServerFn = ApiMethods & typeof apiServerBase

/**
 * Fetch wrapper dành cho Server Components và Server Actions.
 * - Tự động đọc access_token / refresh_token từ cookie
 * - Retry 1 lần khi nhận 401, không có queue (không cần thiết ở server)
 */
export const apiServer = Object.assign(apiServerBase, {
  get: (endpoint: string, options?: FetchOptions) =>
    apiServer(endpoint, { ...options, method: "GET" }),
  post: (endpoint: string, options?: FetchOptions) =>
    apiServer(endpoint, { ...options, method: "POST" }),
  put: (endpoint: string, options?: FetchOptions) =>
    apiServer(endpoint, { ...options, method: "PUT" }),
  delete: (endpoint: string, options?: FetchOptions) =>
    apiServer(endpoint, {
      ...options,
      method: "DELETE",
      body: JSON.stringify({}),
    }),
  patch: (endpoint: string, options?: FetchOptions) =>
    apiServer(endpoint, { ...options, method: "PATCH" }),
}) as ApiServerFn
