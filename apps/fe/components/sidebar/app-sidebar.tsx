"use client"

import * as React from "react"

import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { BookOpen, LayoutDashboard, PenBox, Search } from "lucide-react"
import { NavConversations } from "./nav-conversations"
import { NavFeats } from "./nav-feats"
import { NavLogo } from "./nav-logo"

export type AppSidebarProps = {
  nav?: {
    feats: {
      title: string
      url: string
      icon: React.ReactNode
    }[]
  }
  enableConv?: boolean
  props?: React.ComponentProps<typeof Sidebar>
}

const data = {
  feats: [
    {
      title: "Bảng điều khiển",
      url: "/",
      icon: <LayoutDashboard />,
    },
    {
      title: "Đoạn chat mới",
      url: "/new",
      icon: <PenBox />,
    },
    {
      title: "Tìm kiếm đoạn chat",
      action: "search",
      icon: <Search />,
    },
    {
      title: "Danh sách bài học",
      url: "/lessons",
      icon: <BookOpen />,
    },
  ],
}

export function AppSidebar({
  nav,
  enableConv = true,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavFeats items={nav?.feats || data.feats} />
        {enableConv && <NavConversations />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
