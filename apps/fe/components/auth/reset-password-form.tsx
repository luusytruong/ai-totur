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
import { resetPassword } from "@/lib/actions/auth"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { ResetPasswordInput, ResetPasswordSchema } from "@workspace/types"
import { KeyRoundIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

export function ResetPasswordForm({
  token,
  callbackUrl,
  className,
  ...props
}: {
  token: string
  callbackUrl?: string
} & React.ComponentProps<"div">) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token: token,
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = (values: ResetPasswordInput) => {
    startTransition(async () => {
      try {
        const result = await resetPassword(values)
        if (!result.success) {
          toast.error(result.message)
          return
        }
        toast.success(result.message)
        router.push("/login")
      } catch (error) {
        console.error(error)
        toast.error("Đã có lỗi xảy ra, vui lòng thử lại sau")
      }
    })
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
              Đặt lại mật khẩu {siteConfig.title}.
            </h1>
            <FieldDescription>
              Bạn đã có tài khoản?{" "}
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

          <Input type="hidden" {...form.register("token")} />

          <Field>
            <FieldLabel htmlFor="password">Mật khẩu mới</FieldLabel>
            <FieldContent>
              <Input
                id="password"
                {...form.register("password")}
                type="password"
                placeholder="••••••••"
                disabled={isPending}
              />
            </FieldContent>
            <FieldError errors={[form.formState.errors.password]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="confirmPassword">Xác nhận mật khẩu</FieldLabel>
            <FieldContent>
              <Input
                id="confirmPassword"
                {...form.register("confirmPassword")}
                type="password"
                placeholder="••••••••"
                disabled={isPending}
              />
            </FieldContent>
            <FieldError errors={[form.formState.errors.confirmPassword]} />
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
                  <KeyRoundIcon className="mr-2 h-4 w-4" />
                  <span>Cập nhật mật khẩu</span>
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
