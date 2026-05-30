"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { User } from "@workspace/types"

import { DataTableColumnHeader } from "@/components/admin/data-table-column-header"
import { UserRowActions } from "@/components/admin/user-actions"
import { Badge } from "@/components/ui/badge"

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "displayName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên hiển thị" />
    ),
    cell: ({ row }) => row.original.displayName || "Chưa cập nhật",
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vai trò" />
    ),
    cell: ({ row }) => (
      <Badge variant={row.original.role === "admin" ? "default" : "secondary"}>
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString("vi-VN"),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <UserRowActions user={row.original} />
      </div>
    ),
  },
]
