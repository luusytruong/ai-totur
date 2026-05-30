import { RegisterForm } from "@/components/auth/register-form"
import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Đăng ký",
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm className="animate-in duration-500 slide-in-from-left-10 fade-in" />
    </Suspense>
  )
}
