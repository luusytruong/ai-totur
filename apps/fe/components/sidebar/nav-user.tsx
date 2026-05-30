"use client"

import { useCurrentUser } from "@/components/providers/current-user-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { logout } from "@/lib/actions/auth"
import {
  ChevronsUpDownIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MoonStar,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Kbd, KbdGroup } from "../ui/kbd"
import { ChangeInfoDialog } from "./change-info-dialog"

export function NavUser() {
  const { resolvedTheme, setTheme } = useTheme()
  const { isMobile } = useSidebar()
  const { user } = useCurrentUser()
  const displayName = user.displayName || user.email
  const displayChar = displayName.charAt(0).toUpperCase()
  const avatar = ""

  const themeIcon = resolvedTheme === "dark" ? <MoonStar /> : <Sun />

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatar} alt={displayName} />
                <AvatarFallback className="">{displayChar}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatar} alt={displayName} />
                  <AvatarFallback className="">{displayChar}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.role === "admin" && (
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboardIcon />
                    Bảng điều khiển
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            )}
            <DropdownMenuGroup>
              <ChangeInfoDialog />
            </DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              {themeIcon}
              Sáng/Tối
              <KbdGroup className="ml-auto">
                <Kbd>Shift</Kbd>
                <span>+</span>
                <Kbd>d</Kbd>
              </KbdGroup>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOutIcon />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
