import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Lấy token từ cookies (Fastify trả về access_token / refresh_token)
  const hasAccessToken = req.cookies.has("access_token")
  const hasRefreshToken = req.cookies.has("refresh_token")
  const isLoggedIn = hasAccessToken || hasRefreshToken

  const isAuthPath = AUTH_PATHS.includes(pathname)

  // Nếu user chưa đăng nhập và đang truy cập vào trang không công khai, redirect về login
  // Proxy KHÔNG redirect logged-in users ra khỏi auth pages vì không thể xác minh session
  // còn hợp lệ hay không (token có thể hết hạn, user bị xoá khỏi DB, v.v.)
  // → để login page / layout tự xử lý redirect
  if (!isLoggedIn && !isAuthPath) {
    const redirectUrl = new URL("/login", req.url)
    // Chỉ thêm callbackUrl nếu trang hiện tại không phải là trang chủ "/"
    if (pathname !== "/") {
      redirectUrl.searchParams.set("callbackUrl", pathname)
    }
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Kết hợp matcher: bảo vệ toàn bộ app trừ api/static/favicon
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
