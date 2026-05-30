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
import { BookOpen, ChartSpline, PenBox, Search } from "lucide-react"
import { NavConversations } from "./sidebar/nav-conversations"
import { NavFeats } from "./sidebar/nav-feats"
import { NavLogo } from "./sidebar/nav-logo"

const data = {
  feats: [
    {
      title: "Tổng quan",
      url: "/",
      icon: <ChartSpline />,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavFeats items={data.feats} />
        <NavConversations />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
