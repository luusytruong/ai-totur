import type { ApiResponse } from "@workspace/types"

export const API_BASE_URL =
  typeof window !== "undefined"
    ? "/api"
    : process.env.API_URL || "http://localhost:3001/api"

// ─── Types ────────────────────────────────────────────────────────────────────

export type FetchOptions = Omit<RequestInit, "headers"> & {
  params?: Record<string, string>
  headers?: Record<string, string>
}

export type ApiMethods = {
  get<T>(endpoint: string, options?: FetchOptions): Promise<T>
  post<T>(endpoint: string, options?: FetchOptions): Promise<T>
  put<T>(endpoint: string, options?: FetchOptions): Promise<T>
  delete<T>(endpoint: string, options?: FetchOptions): Promise<T>
  patch<T>(endpoint: string, options?: FetchOptions): Promise<T>
}

export type TokenProvider = () => Promise<string | null> | string | null

// ─── Error ────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// ─── URL builder ──────────────────────────────────────────────────────────────

export function buildUrl(
  endpoint: string,
  params?: Record<string, string>
): string {
  const clean = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  const url = `${API_BASE_URL}${clean}`
  if (!params) return url
  return `${url}?${new URLSearchParams(params).toString()}`
}

// ─── Headers builder ──────────────────────────────────────────────────────────

export function buildHeaders(
  token: string | null,
  body: RequestInit["body"],
  extra: Record<string, string> = {}
): Record<string, string> {
  const isFormData = body instanceof FormData
  return {
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...extra,
  }
}

// ─── Response parser ──────────────────────────────────────────────────────────

export async function parseResponse<T>(response: Response): Promise<T> {
  const result = (await response.json().catch(() => ({}))) as ApiResponse<T>

  if (!response.ok || result.success === false) {
    throw new ApiError(
      result.message ?? "Có lỗi xảy ra, vui lòng thử lại.",
      response.status,
      result.data
    )
  }

  return result as T
}
