"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ExerciseRow } from "@workspace/types"
import { DataTableColumnHeader } from "./data-table-column-header"
import { ExerciseRowActions } from "./exercise-actions"

export const exerciseColumns: ColumnDef<ExerciseRow>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên bài tập" />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-primary">{row.getValue("title")}</span>
    ),
  },
  {
    accessorKey: "lessonId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bài học (ID)" />
    ),
    cell: ({ row }) => <div>{row.getValue("lessonId")}</div>,
  },
  {
    accessorKey: "testCases",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số test cases" />
    ),
    cell: ({ row }) => {
      const tc = row.original.testCases
      return <div>{Array.isArray(tc) ? tc.length : 0} cases</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ExerciseRowActions row={row} />,
  },
]
