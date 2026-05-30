import { AdminDataTable } from "@/components/admin/data-table"
import { ExerciseToolbarActions } from "@/components/admin/exercise-actions"
import { exerciseColumns } from "@/components/admin/exercises-columns"
import { listExercisesAdmin } from "@/lib/actions/exercises"

export const metadata = {
  title: "Bài tập & Test Cases",
}

async function ExercisesPage() {
  const res = await listExercisesAdmin()
  const data = res.data ?? []

  return (
    <AdminDataTable
      title="Bài tập & Test Cases"
      description="Quản lý bài tập thực hành và bộ test cases."
      data={data}
      columns={exerciseColumns}
      toolbarActions={<ExerciseToolbarActions key="exercise-actions-toolbar" />}
      searchColumn="title"
      searchPlaceholder="Tìm theo tiêu đề bài tập..."
    />
  )
}

export default ExercisesPage
