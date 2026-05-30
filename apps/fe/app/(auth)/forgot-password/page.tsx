import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Quên mật khẩu",
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm className="animate-in duration-500 slide-in-from-left-10 fade-in" />
    </Suspense>
  )
}
