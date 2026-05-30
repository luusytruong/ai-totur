"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sparkles } from "lucide-react"
import { usePathname } from "next/navigation"
import { useCurrentUser } from "../providers/current-user-provider"
import { Button } from "../ui/button"

const DISPLAY_LEVEL = {
  beginner: "Người mới bắt đầu",
  intermediate: "Thành viên",
  advanced: "Chuyên gia",
}

function Header() {
  const pathname = usePathname()
  const { user } = useCurrentUser()

  // console.log(user)

  const isDashboard = pathname.startsWith("/dashboard")

  const isMobile = useIsMobile()

  if (isDashboard && !isMobile) return null

  return (
    <div className="flex h-16 w-full shrink-0 items-center gap-2 border-b">
      <div className="flex items-center justify-center bg-transparent">
        <Button className="bg-primary/10 text-foreground backdrop-blur-sm hover:bg-primary/20">
          <Sparkles fill="currentColor" strokeWidth={1} />
          {user ? DISPLAY_LEVEL[user.level] : "Lumi Coding"}
        </Button>
      </div>
      <div className="relative flex items-center gap-2 px-4 md:hidden">
        <SidebarTrigger className="-ml-1 backdrop-blur-sm" />
      </div>
    </div>
  )
}

export default Header
