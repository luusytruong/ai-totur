"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { apiClient } from "@/lib/api/apiClient"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useQuery } from "@tanstack/react-query"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table"
import type { UserProgressResponse } from "@workspace/types"
import { GripVerticalIcon } from "lucide-react"
import * as React from "react"

type SubmissionInfo = {
  id: number
  lessonTitle: string
  exerciseTitle: string
  score: number
  status: string
}

function isSameSubmissionData(left: SubmissionInfo[], right: SubmissionInfo[]) {
  if (left.length !== right.length) {
    return false
  }

  return left.every((item, index) => {
    const other = right[index]

    return (
      item.id === other.id &&
      item.lessonTitle === other.lessonTitle &&
      item.exerciseTitle === other.exerciseTitle &&
      item.score === other.score &&
      item.status === other.status
    )
  })
}

function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const columns: ColumnDef<SubmissionInfo>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    accessorKey: "lessonTitle",
    header: "Bài học",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate font-medium">
        {row.getValue("lessonTitle")}
      </div>
    ),
  },
  {
    accessorKey: "exerciseTitle",
    header: "Bài tập",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.getValue("exerciseTitle")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "Đạt" ? "default" : "secondary"}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "score",
    header: () => <div className="text-right">Điểm số</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("score"))
      return <div className="text-right font-medium">{amount} XP</div>
    },
  },
]

function DraggableRow({ row }: { row: Row<SubmissionInfo> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="py-3">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function SubmittedExercisesTable() {
  const { data: progressRes, isPending } = useQuery<UserProgressResponse>({
    queryKey: ["progress-me"],
    queryFn: () => apiClient.get<UserProgressResponse>("/progress/me"),
  })

  const fallbackEmpty = React.useMemo(() => [], [])
  const rawData = progressRes?.data ?? fallbackEmpty

  const initialData = React.useMemo(
    () =>
      rawData
        .filter((item) => item.exerciseId)
        .map((item) => ({
          id: item.id,
          lessonTitle: item.lesson?.title ?? "Không rõ",
          exerciseTitle: item.exercise?.title ?? "Không rõ",
          score: item.score ?? 0,
          status: item.completionStatus === "completed" ? "Đạt" : "Đang làm",
        })),
    [rawData]
  )

  const [data, setData] = React.useState<SubmissionInfo[]>([])

  // Only sync from backend if backend data fundamentally changes
  React.useEffect(() => {
    setData((currentData) =>
      isSameSubmissionData(currentData, initialData) ? currentData : initialData
    )
  }, [initialData])

  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data.map(({ id }) => id),
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id.toString(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold">Bài tập đã thực hành</h3>
        <Skeleton className="mt-2 h-8 w-48" />
        <Skeleton className="mt-4 h-[200px] w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="px-1">
        <h3 className="text-lg font-bold">Bài tập đã thực hành</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Các bài tập bạn đã nộp và số điểm tương ứng.
        </p>
      </div>
      <div className="overflow-hidden rounded-4xl border bg-card">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id={sortableId}
        >
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.id} row={row} />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Chưa có bài tập nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  )
}
