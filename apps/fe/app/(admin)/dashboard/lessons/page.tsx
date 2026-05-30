import { AdminDataTable } from "@/components/admin/data-table"
import { LessonToolbarActions } from "@/components/admin/lesson-actions"
import { lessonColumns } from "@/components/admin/lessons-columns"
import { listLessonsAdmin } from "@/lib/actions/lessons"

export const metadata = {
  title: "Bài học",
}

async function LessonsPage() {
  const res = await listLessonsAdmin()
  const data = res.data ?? []

  return (
    <AdminDataTable
      title="Bài học"
      description="Quản lý bài giảng và lý thuyết lập trình."
      data={data}
      columns={lessonColumns}
      toolbarActions={<LessonToolbarActions key="lesson-actions-toolbar" />}
      searchColumn="title"
      searchPlaceholder="Tìm theo tiêu đề..."
    />
  )
}

export default LessonsPage
