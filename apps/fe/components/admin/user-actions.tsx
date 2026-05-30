"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  type CreateUserInput,
  type UpdateUserInput,
  type User,
} from "@workspace/types"
import { Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { createUser, deleteUser, updateUser } from "@/lib/actions/users"

const userCreateFormSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z
    .string()
    .min(6, { message: "Mật khẩu ít nhất 6 ký tự" })
    .max(100)
    .optional(),
  displayName: z.string().min(2, { message: "Tên hiển thị ít nhất 2 ký tự" }),
  role: z.enum(["admin", "student"], { message: "Vai trò không hợp lệ" }),
  level: z.enum(["beginner", "intermediate", "advanced"], {
    message: "Vui lòng chọn trình độ hợp lệ",
  }),
})
const userUpdateFormSchema = z
  .object({
    displayName: z
      .string()
      .min(2, { message: "Tên hiển thị phải có ít nhất 2 ký tự." }),
    level: z
      .enum(["beginner", "intermediate", "advanced"], {
        message: "Vui lòng chọn trình độ hợp lệ",
      })
      .optional(),
    preferredLanguage: z.string().optional().nullable(),
    role: z.enum(["admin", "student"], {
      message: "Vui lòng chọn vai trò hợp lệ",
    }),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        if (data.password.length < 6) return false
      }
      return true
    },
    { message: "Mật khẩu ít nhất 6 ký tự", path: ["password"] }
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

type UserCreateFormValues = z.infer<typeof userCreateFormSchema>
type UserUpdateFormValues = z.infer<typeof userUpdateFormSchema>

function UserCreateDialog() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<UserCreateFormValues>({
    resolver: zodResolver(userCreateFormSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
      role: "student",
      level: "beginner",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        email: "",
        password: "",
        displayName: "",
        role: "student",
        level: "beginner",
      })
    }
  }, [form, open])

  const handleSubmit = (values: UserCreateFormValues) => {
    startTransition(async () => {
      const result = await createUser(values as CreateUserInput)
      if (!result.success) {
        toast.error(result.message || "Không thể tạo tài khoản")
        return
      }

      toast.success("Tạo tài khoản thành công")
      setOpen(false)
      form.reset()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Thêm tài khoản
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm tài khoản</DialogTitle>
          <DialogDescription>
            Tạo nhanh tài khoản mới cho người dùng hoặc quản trị viên.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="user-email">Email</FieldLabel>
              <FieldContent>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="admin@example.com"
                  disabled={isPending}
                  {...form.register("email")}
                />
              </FieldContent>
              <FieldError errors={[form.formState.errors.email]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="user-display-name">Tên hiển thị</FieldLabel>
              <FieldContent>
                <Input
                  id="user-display-name"
                  placeholder="Nguyễn Văn A"
                  disabled={isPending}
                  {...form.register("displayName")}
                />
              </FieldContent>
              <FieldError errors={[form.formState.errors.displayName]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="user-password">Mật khẩu</FieldLabel>
              <FieldContent>
                <Input
                  id="user-password"
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  disabled={isPending}
                  {...form.register("password")}
                />
              </FieldContent>
              <FieldError errors={[form.formState.errors.password]} />
            </Field>

            <Field>
              <FieldLabel>Vai trò</FieldLabel>
              <FieldContent>
                <Select
                  // eslint-disable-next-line react-hooks/incompatible-library
                  value={form.watch("role")}
                  onValueChange={(value) =>
                    form.setValue(
                      "role",
                      value as UserCreateFormValues["role"],
                      {
                        shouldValidate: true,
                      }
                    )
                  }
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent className="p-1.5">
                    <SelectItem value="student">Người dùng</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
              <FieldError errors={[form.formState.errors.role]} />
            </Field>

            <Field>
              <FieldLabel>Trình độ</FieldLabel>
              <FieldContent>
                <Select
                  value={form.watch("level")}
                  onValueChange={(value) =>
                    form.setValue(
                      "level",
                      value as UserCreateFormValues["level"],
                      { shouldValidate: true }
                    )
                  }
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trình độ" />
                  </SelectTrigger>
                  <SelectContent className="p-1.5">
                    <SelectItem value="beginner">Người mới bắt đầu</SelectItem>
                    <SelectItem value="intermediate">Trung bình</SelectItem>
                    <SelectItem value="advanced">Nâng cao</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
              <FieldError errors={[form.formState.errors.level]} />
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
                Tạo tài khoản
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function UserEditDialog({ user }: { user: User }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<UserUpdateFormValues>({
    resolver: zodResolver(userUpdateFormSchema),
    defaultValues: {
      displayName: user.displayName ?? "",
      level: user.level ?? "beginner",
      preferredLanguage: user.preferredLanguage ?? "",
      role: user.role === "admin" ? "admin" : "student",
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        displayName: user.displayName ?? "",
        level: user.level ?? "beginner",
        preferredLanguage: user.preferredLanguage ?? "",
        role: user.role === "admin" ? "admin" : "student",
        password: "",
        confirmPassword: "",
      })
    }
  }, [
    form,
    open,
    user.displayName,
    user.level,
    user.preferredLanguage,
    user.role,
  ])

  const handleSubmit = (values: UserUpdateFormValues) => {
    startTransition(async () => {
      const result = await updateUser(user.id, values as UpdateUserInput)
      if (!result.success) {
        toast.error(result.message || "Không thể cập nhật tài khoản")
        return
      }

      toast.success("Cập nhật tài khoản thành công")
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
          <Pencil className="size-4" />
          Sửa tài khoản
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sửa tài khoản</DialogTitle>
          <DialogDescription>
            Cập nhật tên hiển thị hoặc quyền truy cập cho tài khoản này.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <FieldContent>
                <Input value={user.email} disabled />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor={`user-display-name-${user.id}`}>
                Tên hiển thị
              </FieldLabel>
              <FieldContent>
                <Input
                  id={`user-display-name-${user.id}`}
                  disabled={isPending}
                  {...form.register("displayName")}
                />
              </FieldContent>
              <FieldError errors={[form.formState.errors.displayName]} />
            </Field>

            <Field>
              <FieldLabel>Trình độ</FieldLabel>
              <FieldContent>
                <Select
                  // eslint-disable-next-line react-hooks/incompatible-library
                  value={form.watch("level") || "beginner"}
                  onValueChange={(value) =>
                    form.setValue(
                      "level",
                      value as UserUpdateFormValues["level"],
                      { shouldValidate: true }
                    )
                  }
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn trình độ" />
                  </SelectTrigger>
                  <SelectContent className="p-1.5">
                    <SelectItem value="beginner">Người mới bắt đầu</SelectItem>
                    <SelectItem value="intermediate">Trung bình</SelectItem>
                    <SelectItem value="advanced">Nâng cao</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
              <FieldError errors={[form.formState.errors.level]} />
            </Field>

            <Field>
              <FieldLabel>Ngôn ngữ ưa thích</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Ví dụ: java, c++,..."
                  disabled={isPending}
                  {...form.register("preferredLanguage")}
                />
              </FieldContent>
              <FieldError errors={[form.formState.errors.preferredLanguage]} />
            </Field>

            <Field>
              <FieldLabel>Vai trò</FieldLabel>
              <FieldContent>
                <Select
                  value={form.watch("role")}
                  onValueChange={(value) =>
                    form.setValue(
                      "role",
                      value as UserUpdateFormValues["role"],
                      { shouldValidate: true }
                    )
                  }
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent className="p-1.5">
                    <SelectItem value="student">Người dùng</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
              <FieldError errors={[form.formState.errors.role]} />
            </Field>

            <Field>
              <FieldLabel>Mật khẩu mới (Để trống nếu không đổi)</FieldLabel>
              <FieldContent>
                <Input
                  type="password"
                  disabled={isPending}
                  {...form.register("password")}
                />
              </FieldContent>
              <FieldError errors={[form.formState.errors.password]} />
            </Field>

            <Field>
              <FieldLabel>Nhập lại mật khẩu</FieldLabel>
              <FieldContent>
                <Input
                  type="password"
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

function UserDeleteDialog({ user }: { user: User }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUser(user.id)
      if (!result.success) {
        toast.error(result.message || "Không thể xóa tài khoản")
        return
      }

      toast.success("Xóa tài khoản thành công")
      setOpen(false)
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={(event) => event.preventDefault()}
        >
          <Trash2 className="size-4" />
          Xóa tài khoản
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa tài khoản này?</AlertDialogTitle>
          <AlertDialogDescription>
            Tài khoản <strong>{user.email}</strong> sẽ bị xóa khỏi hệ thống.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function UserToolbarActions() {
  return <UserCreateDialog />
}

export function UserRowActions({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="rounded-2xl">
          <span className="sr-only">Mở thao tác</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <UserEditDialog user={user} />
        <DropdownMenuSeparator />
        <UserDeleteDialog user={user} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
