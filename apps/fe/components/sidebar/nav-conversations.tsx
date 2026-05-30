"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { deleteConversation, shareConversation } from "@/lib/actions/chat"
import { cn } from "@/lib/utils"
import { ConversationRow } from "@workspace/types"
import { Copy, MoreHorizontalIcon, Trash2Icon, Upload } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import React from "react"
import { toast } from "sonner"
import { useSearch } from "../providers/search-conversation-provider"

type SidebarConversation = {
  id: string
  title: string
  url: string
  isDisabled?: boolean
}

function toSidebarConversation(
  conversation: ConversationRow
): SidebarConversation {
  return {
    id: conversation.id,
    title: conversation.title,
    url: `/${conversation.id}`,
    isDisabled: conversation.isDisabled,
  }
}

export function NavConversations() {
  const { isMobile } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()
  const { conversations } = useSearch()
  const [deleteTarget, setDeleteTarget] =
    React.useState<SidebarConversation | null>(null)
  const [shareTarget, setShareTarget] =
    React.useState<SidebarConversation | null>(null)
  const [sharedLink, setSharedLink] = React.useState("")
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isSharing, setIsSharing] = React.useState(false)

  const sidebarConversations = React.useMemo(() => {
    return conversations.map(toSidebarConversation)
  }, [conversations])

  const isBusy = isDeleting || isSharing

  const handleShare = React.useCallback(
    async (conversation: SidebarConversation) => {
      setIsSharing(true)
      try {
        const response = await shareConversation(conversation.id)
        const publicUrl =
          response.data?.publicUrl ?? `/shared/${conversation.id}`
        const absoluteUrl = `${window.location.origin}${publicUrl}`
        setSharedLink(absoluteUrl)
        setShareTarget(conversation)
        toast.success("Đã tạo liên kết công khai")
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể chia sẻ cuộc trò chuyện"
        )
      } finally {
        setIsSharing(false)
      }
    },
    []
  )

  const handleDelete = React.useCallback(
    async (conversation: SidebarConversation) => {
      setIsDeleting(true)
      try {
        const response = await deleteConversation(conversation.id)
        if (!response.success) {
          throw new Error(response.message ?? "Không thể xoá cuộc trò chuyện")
        }

        window.dispatchEvent(
          new CustomEvent("conversation-deleted", {
            detail: { conversationId: conversation.id },
          })
        )

        if (pathname === conversation.url) {
          router.push("/")
        }

        toast.success("Đã xoá cuộc trò chuyện")
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể xoá cuộc trò chuyện"
        )
      } finally {
        setIsDeleting(false)
        setDeleteTarget(null)
      }
    },
    [pathname, router]
  )

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="truncate whitespace-nowrap">
        Cuộc hội thoại của bạn
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1">
        {sidebarConversations.map((item, index) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              key={item.title}
              isActive={pathname === item.url}
              asChild
              className={cn(
                "animate-in fill-mode-backwards fade-in",
                item.isDisabled && "text-muted-foreground opacity-50"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Link href={item.url}>
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className="aria-expanded:bg-muted"
                >
                  <MoreHorizontalIcon />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-32"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem
                  disabled={isBusy}
                  onSelect={(event) => {
                    event.preventDefault()
                    void handleShare(item)
                  }}
                >
                  <Upload className="text-muted-foreground" />
                  <span>Chia sẻ</span>
                </DropdownMenuItem>
                {/* <DropdownMenuSeparator /> */}
                <DropdownMenuItem
                  disabled={isBusy}
                  onSelect={(event) => {
                    event.preventDefault()
                    setDeleteTarget(item)
                  }}
                >
                  <Trash2Icon color="var(--destructive)" />
                  <span className="text-destructive!">Xoá</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá cuộc trò chuyện?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ ẩn cuộc trò chuyện khỏi danh sách của bạn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBusy}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isBusy}
              onClick={() => {
                if (deleteTarget) {
                  void handleDelete(deleteTarget)
                }
              }}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={shareTarget !== null}
        onOpenChange={(open) => !open && setShareTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Liên kết công khai</AlertDialogTitle>
            <AlertDialogDescription>
              Sao chép liên kết bên dưới để chia sẻ cuộc trò chuyện này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-2xl border border-border bg-muted/40 p-3 text-sm break-all">
            {sharedLink || "Đang tạo liên kết..."}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShareTarget(null)}>
              Đóng
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!sharedLink) return
                await navigator.clipboard.writeText(sharedLink)
                toast.success("Đã sao chép liên kết")
              }}
            >
              <Copy />
              Sao chép
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarGroup>
  )
}
