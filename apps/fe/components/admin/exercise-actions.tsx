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
import { Textarea } from "@/components/ui/textarea"
import {
  createExerciseAdmin,
  deleteExerciseAdmin,
  updateExerciseAdmin,
} from "@/lib/actions/exercises"
import {
  CreateExerciseInput,
  ExerciseRow,
  UpdateExerciseInput,
} from "@workspace/types"
import { useState } from "react"
import { toast } from "sonner"

export function ExerciseToolbarActions() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<CreateExerciseInput>({
    title: "",
    description: "",
    expectedOutput: "",
    lessonId: 0,
    testCases: [{ input: "", expected: "" }],
    starterCode: "",
    hint: "",
  })

  // Basic representation of JSON. In real app, we use field arrays in react-hook-form
  const [tcJson, setTcJson] = useState(
    JSON.stringify([{ input: "", expected: "" }], null, 2)
  )

  async function handleCreate() {
    setLoading(true)
    try {
      const cases = JSON.parse(tcJson)
      const res = await createExerciseAdmin({
        ...formData,
        lessonId: Number(formData.lessonId),
        testCases: cases,
      })
      if (res.success) {
        toast.success("Tạo bài tập thành công")
        setOpen(false)
      } else {
        toast.error(res.message || "Có lỗi xảy ra")
      }
    } catch (e: unknown) {
      // nên in ra lỗi bằng console.error, và không được dùng tiếng anh
      console.error(e)
      toast.error("Định dạng JSON của Test cases không hợp lệ!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="default" size="default" onClick={() => setOpen(true)}>
        Thêm Bài Tập
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm Bài Tập Mới</DialogTitle>
            <DialogDescription className="sr-only">
              Biểu mẫu thêm bài tập
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tên bài tập</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Lesson ID</Label>
              <Input
                type="number"
                value={formData.lessonId}
                onChange={(e) =>
                  setFormData({ ...formData, lessonId: Number(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Mô tả đề (Markdown)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Output mong muốn</Label>
              <Textarea
                value={formData.expectedOutput}
                onChange={(e) =>
                  setFormData({ ...formData, expectedOutput: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Test Cases (JSON array) {"[{input, expected}]"}</Label>
              <Textarea
                className="h-32 font-mono text-sm"
                value={tcJson}
                onChange={(e) => setTcJson(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Starter Code (Tùy chọn)</Label>
              <Textarea
                className="font-mono text-sm"
                value={formData.starterCode ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, starterCode: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Gợi ý (Hint)</Label>
              <Textarea
                value={formData.hint ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, hint: e.target.value })
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

interface ExerciseRowActionsProps {
  row: Row<ExerciseRow>
}

export function ExerciseRowActions({ row }: ExerciseRowActionsProps) {
  const exercise = row.original
  const [deleting, setDeleting] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const [formData, setFormData] = useState<UpdateExerciseInput>({
    title: exercise.title,
    description: exercise.description,
    expectedOutput: exercise.expectedOutput,
    lessonId: exercise.lessonId,
    starterCode: exercise.starterCode ?? undefined,
    hint: exercise.hint ?? undefined,
  })

  const initialCases = exercise.testCases ?? []
  const [tcJson, setTcJson] = useState(JSON.stringify(initialCases, null, 2))

  async function handleDelete() {
    if (!confirm("Bạn có chắc chắn muốn xóa bài tập này?")) return
    setDeleting(true)
    const res = await deleteExerciseAdmin(exercise.id)
    if (res.success) {
      toast.success("Xóa thành công")
    } else {
      toast.error(res.message || "Lỗi khi xóa")
    }
    setDeleting(false)
  }

  async function handleUpdate() {
    try {
      const cases = JSON.parse(tcJson) as unknown
      const params = {
        ...formData,
        testCases: cases as typeof formData.testCases,
      }
      const res = await updateExerciseAdmin(exercise.id, params)
      if (res.success) {
        toast.success("Cập nhật thành công")
        setShowEdit(false)
      } else {
        toast.error(res.message || "Lỗi cập nhật")
      }
    } catch (e: unknown) {
      console.error(e)
      toast.error("Định dạng JSON Test cases không hợp lệ!")
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
            <span className="sr-only">Mở menu</span>
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
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sửa Bài Tập</DialogTitle>
            <DialogDescription className="sr-only">
              Biểu mẫu thay đổi thông tin bài tập
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tên bài tập</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Lesson ID</Label>
              <Input
                type="number"
                value={formData.lessonId ?? 0}
                onChange={(e) =>
                  setFormData({ ...formData, lessonId: Number(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Mô tả đề (Markdown)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Output mong muốn</Label>
              <Textarea
                value={formData.expectedOutput}
                onChange={(e) =>
                  setFormData({ ...formData, expectedOutput: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Test Cases (JSON array) {"[{input, expected}]"}</Label>
              <Textarea
                className="h-32 font-mono text-sm"
                value={tcJson}
                onChange={(e) => setTcJson(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Starter Code</Label>
              <Textarea
                className="font-mono text-sm"
                value={formData.starterCode ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, starterCode: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Gợi ý (Hint)</Label>
              <Textarea
                className="font-mono text-sm"
                value={formData.hint ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, hint: e.target.value })
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
