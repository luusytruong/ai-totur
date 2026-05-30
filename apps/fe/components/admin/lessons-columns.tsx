"use client"

import { Badge } from "@/components/ui/badge"
import { ColumnDef } from "@tanstack/react-table"
import { LessonRow } from "@workspace/types"
import { DataTableColumnHeader } from "./data-table-column-header"
import { LessonRowActions } from "./lesson-actions"

export const lessonColumns: ColumnDef<LessonRow>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên bài học" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex max-w-[300px] items-center space-x-2 truncate">
          <span className="truncate font-medium">{row.getValue("title")}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "language",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngôn ngữ" />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="capitalize">
          {row.getValue("language")}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "topic",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Chủ đề" />
    ),
    cell: ({ row }) => <div>{row.getValue("topic")}</div>,
  },
  {
    accessorKey: "difficulty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Độ khó" />
    ),
    cell: ({ row }) => {
      const diff = row.getValue("difficulty") as string
      return (
        <Badge
          variant={
            diff === "hard"
              ? "destructive"
              : diff === "medium"
                ? "default"
                : "secondary"
          }
        >
          {diff}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <LessonRowActions row={row} />,
  },
]
