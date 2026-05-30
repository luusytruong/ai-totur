"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function AdminInfoList({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("grid gap-3 rounded-2xl bg-muted p-4", className)}>
      {children}
    </div>
  )
}

export function AdminInfoItem({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="grid gap-1">
      <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div className="text-sm">{value}</div>
    </div>
  )
}
