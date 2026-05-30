"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ChangeInfoInput, ChangeInfoSchema } from "@workspace/types"
import { Loader2, UserRoundPen } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { useCurrentUser } from "@/components/providers/current-user-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { changeInfo } from "@/lib/actions/auth"

export function ChangeInfoDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { user, setUser } = useCurrentUser()

  const form = useForm<ChangeInfoInput>({
    resolver: zodResolver(ChangeInfoSchema),
    defaultValues: {
      displayName: user.displayName || "",
      level: user.level || "beginner",
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Reset form when user info changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        displayName: user.displayName || "",
        level: user.level || "beginner",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }
  }, [open, user.displayName, user.level, form])

  const handleSubmit = (values: ChangeInfoInput) => {
    startTransition(async () => {
      const result = await changeInfo(values)
      if (!result.success || !result.data) {
        toast.error(result.message || "Không thể cập nhật thông tin")
        return
      }

      setUser(result.data)

      toast.success("Cập nhật thông tin thành công")
      setOpen(false)
      form.reset()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <UserRoundPen className="size-4" />
          Thông tin tài khoản
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thông tin tài khoản</DialogTitle>
          <DialogDescription>
            Cập nhật tên hiển thị và mật khẩu của bạn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="displayName">Tên hiển thị</FieldLabel>
              <FieldContent>
                <Input
                  id="displayName"
                  placeholder="Nhập tên của bạn"
                  disabled={isPending}
                  {...form.register("displayName")}
                />
              </FieldContent>
              <FieldError errors={[form.formState.errors.displayName]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="level">Trình độ học tập</FieldLabel>
              <FieldContent>
                <Controller
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <SelectTrigger id="level" className="w-full">
                        <SelectValue placeholder="Chọn trình độ của bạn" />
                      </SelectTrigger>
                      <SelectContent className="p-1.5">
                        <SelectItem value="beginner">Mới bắt đầu</SelectItem>
                        <SelectItem value="intermediate">Trung bình</SelectItem>
                        <SelectItem value="advanced">Nâng cao</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FieldContent>
              <FieldError errors={[form.formState.errors.level]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="oldPassword">Mật khẩu cũ</FieldLabel>
              <FieldContent>
                <Input
                  id="oldPassword"
                  type="password"
                  placeholder="••••••••"
                  disabled={isPending}
                  {...form.register("oldPassword")}
                />
              </FieldContent>
              <FieldError errors={[form.formState.errors.oldPassword]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Mật khẩu mới</FieldLabel>
              <FieldContent>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  disabled={isPending}
                  {...form.register("newPassword")}
                />
              </FieldContent>
              <FieldError errors={[form.formState.errors.newPassword]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Xác nhận mật khẩu mới
              </FieldLabel>
              <FieldContent>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  disabled={isPending}
                  {...form.register("confirmPassword")}
                />
              </FieldContent>
              <FieldError errors={[form.formState.errors.confirmPassword]} />
            </Field>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
