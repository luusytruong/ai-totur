"use client"

import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { siteConfig } from "@/config/site"
import Image from "next/image"
import Link from "next/link"

export function NavLogo({ href = "/" }: { href?: string }) {
  const { isMobile } = useSidebar()
  const { state } = useSidebar()

  return (
    <SidebarMenuItem className="flex items-center justify-between">
      <SidebarMenuButton
        size="lg"
        className="h-12 p-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        asChild
      >
        <Link href={href}>
          <div className="flex aspect-square size-8 items-center justify-center p-1 text-sidebar-primary-foreground">
            <Image
              src={siteConfig.logo}
              alt={siteConfig.title}
              width={128}
              height={128}
              className="block"
            />
            {/* <Image
              src="/light.png"
              alt="Logo"
              width={100}
              height={100}
              className="block dark:hidden"
            />
            <Image
              src="/dark.png"
              alt="Logo"
              width={100}
              height={100}
              className="hidden dark:block"
            /> */}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold">{siteConfig.title}</span>
            <span className="truncate text-[10px]">real knowledge</span>
          </div>
        </Link>
      </SidebarMenuButton>
      {/* <div
        className={cn("group-hover:flex", state === "collapsed" && "hidden")}
      >
        <SidebarTrigger
          className={cn(
            "hover:bg-sidebar-accent!",
            state === "collapsed"
              ? "cursor-e-resize!"
              : "size-10 cursor-w-resize!"
          )}
        />
      </div> */}
    </SidebarMenuItem>
  )
}
