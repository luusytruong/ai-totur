"use client"

import { ReactNode } from "react"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"

type Column<T> = {
  key: keyof T
  header: string
  type?: "text" | "badge" | "date"
}

type AdminTableProps<T> = {
  title: string
  description?: string
  data: T[]
  columns: Column<T>[]
  rowKey?: (row: T) => string | number
}

function AdminTable<T>({
  title,
  description,
  data,
  columns,
  rowKey,
}: AdminTableProps<T>) {
  return (
    <div className="mx-auto w-full max-w-4xl p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card size="sm">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={String(col.key)}>{col.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((row, index) => (
                <TableRow key={rowKey ? rowKey(row) : index}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      {col.type === "badge" ? (
                        <Badge>{row[col.key] as ReactNode}</Badge>
                      ) : col.type === "date" ? (
                        new Date(row[col.key] as string).toLocaleString()
                      ) : (
                        (row[col.key] as ReactNode)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminTable
