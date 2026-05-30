"use client"

import type { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"

type DataTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className="text-sm font-medium">{title}</div>
  }

  const isSorted = column.getIsSorted()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 data-[state=open]:bg-accent"
      onClick={() => {
        // Nếu chưa sắp xếp hoặc đang là desc -> chuyển sang asc (toggleSorting(false))
        // Nếu đang là asc -> chuyển sang desc (toggleSorting(true))
        column.toggleSorting(isSorted === "asc")
      }}
    >
      <span className="mr-2 font-semibold tracking-tight">{title}</span>
      {isSorted === "desc" ? (
        <ArrowDown className="size-4 animate-in text-primary fade-in" />
      ) : isSorted === "asc" ? (
        <ArrowUp className="size-4 animate-in text-primary fade-in" />
      ) : (
        <ArrowUpDown className="size-4 text-muted-foreground/50" />
      )}
    </Button>
  )
}
