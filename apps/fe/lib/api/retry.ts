// ─── Types ────────────────────────────────────────────────────────────────────

export type RefreshFn = () => Promise<string | null>

export type RetryOptions = {
  /** Gọi khi nhận 401, trả về access token mới hoặc null nếu thất bại */
  onUnauthorized: RefreshFn
  /** Endpoint hiện tại, dùng để tránh retry vòng lặp trên /auth/refresh */
  endpoint: string
}

// ─── withRetry ────────────────────────────────────────────────────────────────

/**
 * Wrap một fetch call với cơ chế retry 1 lần khi gặp 401.
 * Gọi `onUnauthorized` để lấy token mới, sau đó retry với token đó.
 *
 * @param execute   Hàm thực thi request, nhận token hiện tại, trả về Response
 * @param options   RefreshFn và endpoint để guard vòng lặp
 */
export async function withRetry(
  execute: (token: string | null) => Promise<Response>,
  options: RetryOptions
): Promise<Response> {
  const { onUnauthorized, endpoint } = options
  const isRefreshEndpoint = endpoint.includes("/auth/refresh")

  // Thử lần 1
  let response = await execute(null)

  // Nếu gặp lỗi rate limit (429) -> trả về ngay lập tức
  if (response.status === 429) {
    return response
  }

  // Nếu không phải 401 hoặc là endpoint refresh -> trả về luôn
  if (response.status !== 401 || isRefreshEndpoint) {
    return response
  }

  // 401 → thử refresh (onUnauthorized hỗ trợ queueing)
  const newToken = await onUnauthorized()

  if (!newToken) {
    return response
  }

  // Retry với token mới
  response = await execute(newToken)
  return response
}
