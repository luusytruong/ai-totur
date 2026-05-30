"use client"

import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type AdminDataTableProps<TData, TValue> = {
  title: string
  description?: string
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchColumn?: string
  searchPlaceholder?: string
  toolbarActions?: React.ReactNode
}

export function AdminDataTable<TData, TValue>({
  title,
  description,
  columns,
  data,
  searchColumn,
  searchPlaceholder = "Tìm kiếm...",
  toolbarActions,
}: AdminDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId: (row: TData, index) =>
      (row as { id?: string | number })?.id?.toString() || index.toString(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: (updater) => {
      setSorting(updater)
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  const filterColumn = searchColumn ? table.getColumn(searchColumn) : null

  // return (
  //   <div className="mx-auto w-full p-4">
  //     <Card className="overflow-hidden border-border/60 shadow-none">
  //       <CardHeader className="gap-2 border-b bg-muted/20">
  //         <CardTitle>{title}</CardTitle>
  //         {description ? (
  //           <CardDescription>{description}</CardDescription>
  //         ) : null}
  //       </CardHeader>
  //       <CardContent className="space-y-4">
  //         <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
  //           <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
  //             {filterColumn ? (
  //               <Input
  //                 placeholder={searchPlaceholder}
  //                 value={(filterColumn.getFilterValue() as string) ?? ""}
  //                 onChange={(event) =>
  //                   filterColumn.setFilterValue(event.target.value)
  //                 }
  //                 className="h-9 w-full sm:max-w-sm"
  //               />
  //             ) : null}
  //             {toolbarActions}
  //           </div>

  //           <DropdownMenu>
  //             <DropdownMenuTrigger asChild>
  //               <Button variant="outline" className="md:ml-auto">
  //                 Cột hiển thị
  //                 <ChevronDown className="size-4" />
  //               </Button>
  //             </DropdownMenuTrigger>
  //             <DropdownMenuContent align="end">
  //               {table
  //                 .getAllColumns()
  //                 .filter((column) => column.getCanHide())
  //                 .map((column) => (
  //                   <DropdownMenuCheckboxItem
  //                     key={column.id}
  //                     className="capitalize"
  //                     checked={column.getIsVisible()}
  //                     onCheckedChange={(value) =>
  //                       column.toggleVisibility(!!value)
  //                     }
  //                   >
  //                     {column.id}
  //                   </DropdownMenuCheckboxItem>
  //                 ))}
  //             </DropdownMenuContent>
  //           </DropdownMenu>
  //         </div>

  //         <div className="overflow-hidden rounded-2xl border">
  //           <Table>
  //             <TableHeader>
  //               {table.getHeaderGroups().map((headerGroup) => (
  //                 <TableRow key={headerGroup.id}>
  //                   {headerGroup.headers.map((header) => (
  //                     <TableHead key={header.id}>
  //                       {header.isPlaceholder
  //                         ? null
  //                         : flexRender(
  //                             header.column.columnDef.header,
  //                             header.getContext()
  //                           )}
  //                     </TableHead>
  //                   ))}
  //                 </TableRow>
  //               ))}
  //             </TableHeader>
  //             <TableBody>
  //               {table.getRowModel().rows.length ? (
  //                 table.getRowModel().rows.map((row) => (
  //                   <TableRow key={row.id}>
  //                     {row.getVisibleCells().map((cell) => (
  //                       <TableCell key={cell.id} className="pl-6">
  //                         {flexRender(
  //                           cell.column.columnDef.cell,
  //                           cell.getContext()
  //                         )}
  //                       </TableCell>
  //                     ))}
  //                   </TableRow>
  //                 ))
  //               ) : (
  //                 <TableRow>
  //                   <TableCell
  //                     colSpan={columns.length}
  //                     className="h-24 text-center text-muted-foreground"
  //                   >
  //                     Không có dữ liệu phù hợp.
  //                   </TableCell>
  //                 </TableRow>
  //               )}
  //             </TableBody>
  //           </Table>
  //         </div>

  //         <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
  //           <div>
  //             Hiển thị {table.getRowModel().rows.length} /{" "}
  //             {table.getFilteredRowModel().rows.length} bản ghi.
  //           </div>

  //           <div className="flex items-center gap-2">
  //             <Button
  //               variant="outline"
  //               size="sm"
  //               onClick={() => table.previousPage()}
  //               disabled={!table.getCanPreviousPage()}
  //             >
  //               Trước
  //             </Button>
  //             <Button
  //               variant="outline"
  //               size="sm"
  //               onClick={() => table.nextPage()}
  //               disabled={!table.getCanNextPage()}
  //             >
  //               Sau
  //             </Button>
  //           </div>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   </div>
  // )
  return (
    <div className="mx-auto w-full p-4">
      <div className="overflow-hidden border-border/60 shadow-none">
        <div className="mb-4 gap-2 border-b pb-4">
          <h1 className="text-xl font-bold">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              {filterColumn ? (
                <Input
                  placeholder={searchPlaceholder}
                  value={(filterColumn.getFilterValue() as string) ?? ""}
                  onChange={(event) =>
                    filterColumn.setFilterValue(event.target.value)
                  }
                  className="w-full sm:max-w-sm"
                />
              ) : null}
              {toolbarActions}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="md:ml-auto">
                  Cột hiển thị
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="overflow-hidden rounded-2xl border bg-muted/20">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="pl-6">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Không có dữ liệu phù hợp.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div>
              Hiển thị {table.getRowModel().rows.length} /{" "}
              {table.getFilteredRowModel().rows.length} bản ghi.
            </div>

            <div className="flex items-center gap-2">
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
          </div>
        </div>
      </div>
    </div>
  )
}
