import { getCurrentUser } from "@/lib/server-auth"
import { redirect } from "next/navigation"

async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Nếu user đã đăng nhập hợp lệ (session còn tốt, user tồn tại trong DB) → về trang chính
  const user = await getCurrentUser()
  if (user) {
    redirect("/")
  }

  return (
    <div className="flex h-svh items-center justify-center p-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}

export default AuthLayout
