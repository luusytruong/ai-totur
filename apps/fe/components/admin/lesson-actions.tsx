"use client"

import { Row } from "@tanstack/react-table"
import { FileEdit, MoreHorizontal, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  createLessonAdmin,
  deleteLessonAdmin,
  updateLessonAdmin,
} from "@/lib/actions/lessons"
import {
  CreateLessonInput,
  LessonRow,
  UpdateLessonInput,
} from "@workspace/types"
import { useState } from "react"
import { toast } from "sonner"

export function LessonToolbarActions() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<CreateLessonInput>({
    title: "",
    language: "java",
    topic: "basic",
    difficulty: "easy",
    contentMd: "",
  })

  async function handleCreate() {
    setLoading(true)
    try {
      const res = await createLessonAdmin(formData)
      if (res.success) {
        toast.success("Tạo bài học thành công")
        setOpen(false)
      } else {
        toast.error(res.message || "Có lỗi xảy ra")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="default" size="default" onClick={() => setOpen(true)}>
        Thêm Bài Học
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Bài Học Mới</DialogTitle>
            <DialogDescription className="sr-only">
              Biểu mẫu thêm bài học mới
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tên bài học</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Ngôn ngữ</Label>
              <Input
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Độ khó</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(val: "easy" | "medium" | "hard") =>
                  setFormData({ ...formData, difficulty: val })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Nội dung (Markdown)</Label>
              <Textarea
                className="h-60"
                value={formData.contentMd}
                onChange={(e) =>
                  setFormData({ ...formData, contentMd: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={loading} onClick={handleCreate}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface LessonRowActionsProps {
  row: Row<LessonRow>
}

export function LessonRowActions({ row }: LessonRowActionsProps) {
  const lesson = row.original
  const [deleting, setDeleting] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const [formData, setFormData] = useState<UpdateLessonInput>({
    title: lesson.title,
    language: lesson.language,
    topic: lesson.topic,
    difficulty: lesson.difficulty,
    contentMd: lesson.contentMd,
  })

  async function handleDelete() {
    if (!confirm("Bạn có chắc chắn muốn xóa bài học này?")) return
    setDeleting(true)
    const res = await deleteLessonAdmin(lesson.id)
    if (res.success) {
      toast.success("Xóa thành công")
    } else {
      toast.error(res.message || "Lỗi khi xóa")
    }
    setDeleting(false)
  }

  async function handleUpdate() {
    const res = await updateLessonAdmin(lesson.id, formData)
    if (res.success) {
      toast.success("Cập nhật thành công")
      setShowEdit(false)
    } else {
      toast.error(res.message || "Lỗi cập nhật")
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setShowEdit(true)}>
            <FileEdit className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Sửa
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa Bài Học</DialogTitle>
            <DialogDescription className="sr-only">
              Cập nhật thông tin bài học lập trình
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tên bài học</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Ngôn ngữ</Label>
              <Input
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Độ khó</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(val: "easy" | "medium" | "hard") =>
                  setFormData({ ...formData, difficulty: val })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Nội dung (Markdown)</Label>
              <Textarea
                className="h-60"
                value={formData.contentMd}
                onChange={(e) =>
                  setFormData({ ...formData, contentMd: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
