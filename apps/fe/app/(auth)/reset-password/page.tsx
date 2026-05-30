import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu",
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; callbackUrl?: string }>
}) {
  const { token, callbackUrl } = await searchParams

  if (!token) {
    redirect("/login")
  }

  return <ResetPasswordForm token={token} callbackUrl={callbackUrl} />
}
