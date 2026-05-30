import { LoginForm } from "@/components/auth/login-form"
import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Đăng nhập",
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm className="animate-in duration-500 slide-in-from-left-10 fade-in" />
    </Suspense>
  )
}
