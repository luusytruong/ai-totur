"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { titleStore } from "@/store/title-store"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

const DISPLAY_TITLE = {
  new: "Đoạn chat mới",
  lessons: "Danh sách bài học",
  exercises: "Danh sách bài tập",
  home: "Tổng quan",
}

export function SiteHeader() {
  const { title } = titleStore()
  const pathname = usePathname()

  const displayTitle = useMemo(() => {
    if (pathname === "/") {
      return DISPLAY_TITLE.home
    }
    const path = pathname.split("/")[1]
    if (path in DISPLAY_TITLE) {
      return DISPLAY_TITLE[path as keyof typeof DISPLAY_TITLE]
    }
    return title
  }, [pathname, title])

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <div>
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
        </div>
        <h1 className="text-base font-medium">{displayTitle}</h1>
      </div>
    </header>
  )
}
