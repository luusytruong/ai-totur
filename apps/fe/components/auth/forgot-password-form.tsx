"use client"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { siteConfig } from "@/config/site"
import { forgotPassword } from "@/lib/actions/auth"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ForgotPasswordInput, ForgotPasswordSchema } from "@workspace/types"
import { Loader2, MailIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import * as React from "react"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isPending, startTransition] = useTransition()
  const [isSuccess, setIsSuccess] = React.useState(false)
  const searchParams = useSearchParams()

  const callbackUrl = searchParams.get("callbackUrl")

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = (values: ForgotPasswordInput) => {
    startTransition(async () => {
      try {
        const result = await forgotPassword(values)
        if (!result.success) {
          toast.error(result.message)
          return
        }
        setIsSuccess(true)
        toast.success(result.message)
      } catch (error) {
        console.error(error)
        toast.error("Đã có lỗi xảy ra, vui lòng thử lại sau")
      }
    })
  }

  if (isSuccess) {
    return (
      <div
        className={cn("flex flex-col gap-6 text-center", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailIcon className="size-8" />
          </div>
          <h1 className="text-2xl font-bold">Kiểm tra email của bạn</h1>
          <p className="max-w-md text-muted-foreground">
            Chúng tôi đã gửi một liên kết đặt lại mật khẩu đến email của bạn.
            Vui lòng kiểm tra hộp thư đến.
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="text-sm font-medium underline underline-offset-4"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-8 items-center justify-center rounded-md">
              <Image
                src={siteConfig.logo}
                width={128}
                height={128}
                alt={siteConfig.title}
              />
            </div>
            <h1 className="text-xl font-bold">
              Quên mật khẩu {siteConfig.title}.
            </h1>
            <FieldDescription>
              Bạn đã nhớ mật khẩu?{" "}
              <Link
                href={
                  callbackUrl
                    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
                    : "/login"
                }
              >
                Đăng nhập
              </Link>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <FieldContent>
              <Input
                id="email"
                {...form.register("email")}
                type="email"
                placeholder="m@example.com"
                disabled={isPending}
              />
            </FieldContent>
            <FieldError errors={[form.formState.errors.email]} />
          </Field>
          <Field>
            <Button type="submit" disabled={isPending} className="h-10">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <MailIcon className="mr-2 h-4 w-4" />
                  <span>Xác nhận</span>
                </>
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-4 text-center">
        Bằng cách nhấp vào tiếp tục, bạn đồng ý với{" "}
        <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a>{" "}
        của chúng tôi.
      </FieldDescription>
    </div>
  )
}
