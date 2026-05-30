"use client"

import { MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type DataTableRowActionsProps = {
  id: number | string
  label?: string
}

export function DataTableRowActions({
  id,
  label = "Bản ghi",
}: DataTableRowActionsProps) {
  async function handleCopyId() {
    try {
      await navigator.clipboard.writeText(String(id))
      toast.success(`Đã sao chép ID ${label.toLowerCase()}`)
    } catch {
      toast.error("Không thể sao chép ID")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="rounded-2xl">
          <span className="sr-only">Mở thao tác</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyId}>Sao chép ID</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
