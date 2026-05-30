"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api/apiClient"
import { useQuery } from "@tanstack/react-query"
import type { ConversationsResponse } from "@workspace/types"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Bot, ChevronRight, MessageSquare, PlusCircle } from "lucide-react"
import Link from "next/link"

export function RecentChat() {
  const { data: convRes, isPending } = useQuery<ConversationsResponse>({
    queryKey: ["recent-chats"],
    queryFn: () => apiClient.get<ConversationsResponse>("/conversations"),
  })

  const chats = convRes?.data?.slice(0, 4) ?? []

  if (isPending) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold">
            Lịch sử AI Tutor
          </CardTitle>
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <ItemGroup className="gap-2.5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl" />
            ))}
          </ItemGroup>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Bot className="size-4 text-primary" />
          AI Tutor
        </CardTitle>
        <Link href="/new">
          <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs">
            <PlusCircle className="size-3.5" />
            Mới
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {chats.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="rounded-full bg-muted p-3 text-primary">
              <MessageSquare className="size-6 text-primary" />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Bạn chưa có cuộc trò chuyện nào.
              <br />
              Hãy hỏi AI Tutor ngay!
            </p>
            <Link href="/new">
              <Button size="sm" className="gap-1.5 text-xs">
                <PlusCircle className="size-3.5" />
                Bắt đầu
              </Button>
            </Link>
          </div>
        )}
        <ItemGroup className="gap-2.5">
          {chats.map((chat) => (
            <Item key={chat.id} variant="muted" size="sm" asChild>
              <Link href={`/${chat.id}`} className="justify-between">
                <ItemContent className="min-w-0 gap-1">
                  <ItemTitle className="w-full text-xs leading-tight font-semibold">
                    <span className="truncate">{chat.title}</span>
                  </ItemTitle>
                  <ItemDescription className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(chat.updatedAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </ItemDescription>
                </ItemContent>
                <ItemMedia variant="icon" className="text-muted-foreground">
                  <ChevronRight className="size-3.5 transition-transform group-hover/item:translate-x-0.5" />
                </ItemMedia>
              </Link>
            </Item>
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  )
}
