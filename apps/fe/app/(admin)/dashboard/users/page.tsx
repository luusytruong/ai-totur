import { AdminDataTable } from "@/components/admin/data-table"
import { UserToolbarActions } from "@/components/admin/user-actions"
import { userColumns } from "@/components/admin/users-columns"
import { listUsers } from "@/lib/actions/users"

export const metadata = {
  title: "Người dùng",
}

async function UsersPage() {
  const users = await listUsers()
  return (
    <AdminDataTable
      title="Tài khoản"
      description="Theo dõi người dùng, email đăng ký và quyền truy cập."
      data={users.data ?? []}
      columns={userColumns}
      toolbarActions={<UserToolbarActions key="user-actions-toolbar" />}
      searchColumn="email"
      searchPlaceholder="Tìm theo email..."
    />
  )
}

export default UsersPage
