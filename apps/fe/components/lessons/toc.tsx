"use client"

import { cn } from "@/lib/utils"
import { useMemo } from "react"

interface TOCItem {
  id: string
  title: string
  level: number
}

export function TableOfContents({ content }: { content: string }) {
  const items: TOCItem[] = useMemo(() => {
    // Basic regex to find headings in markdown
    const headingRegex = /^(#{1,3})\s+(.+)$/gm
    const matches = Array.from(content.matchAll(headingRegex))

    return matches.map((match) => ({
      id: match[2].toLowerCase().replace(/\W+/g, "-"),
      title: match[2],
      level: match[1].length,
    }))
  }, [content])

  if (items.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        Mục lục
      </h3>
      <nav className="flex flex-col gap-2">
        {items.map((item: TOCItem) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "text-sm text-muted-foreground transition-colors hover:text-primary",
              item.level === 1 && "font-medium text-foreground",
              item.level === 2 && "pl-3",
              item.level === 3 && "pl-6"
            )}
          >
            {item.title}
          </a>
        ))}
      </nav>
    </div>
  )
}
