"use client"

import { apiClient } from "@/lib/api/apiClient"
import { titleStore } from "@/store/title-store"
import type { ApiResponse } from "@workspace/types"
import { ConversationRow } from "@workspace/types/db"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { useCurrentUser } from "../providers/current-user-provider"
import ChatArea from "./chat-area"

const greetings = [
  "Bạn đã sẵn sàng khám phá chưa?",
  "Chúng ta nên bắt đầu từ đâu?",
  "Bạn muốn tìm hiểu về điều gì hôm nay?",
  "Hãy bắt đầu cuộc trò chuyện!",
]

function getRandomGreeting() {
  return greetings[Math.floor(Math.random() * greetings.length)]?.toLowerCase()
}

function ChatNew() {
  const { user } = useCurrentUser()
  const { setTitle } = titleStore()

  const [input, setInput] = useState("")
  const [isPending, startTransition] = useTransition()

  const router = useRouter()
  const greeting = useMemo(() => getRandomGreeting(), [])

  const handleSend = () => {
    const message = input.trim()
    if (!message || isPending) return

    startTransition(async () => {
      try {
        const response = await apiClient.post<ApiResponse<ConversationRow>>(
          "/conversations",
          {
            body: JSON.stringify({
              title: "Untitled",
            }),
          }
        )

        const conversation = response.data
        if (!conversation) {
          throw new Error("Không thể tạo cuộc hội thoại mới")
        }

        sessionStorage.setItem(
          `pending-chat:${conversation.id}`,
          JSON.stringify({ message })
        )
        window.dispatchEvent(
          new CustomEvent("conversation-created", { detail: conversation })
        )
        setInput("")
        router.push(`/${conversation.id}`)
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Không thể bắt đầu cuộc hội thoại"
        )
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    setTitle("Đoạn chat mới")
  }, [setTitle])

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-6">
        <h1
          key={greeting}
          className="-mt-20 animate-in text-center text-xl fade-in md:text-2xl"
          suppressHydrationWarning
        >
          Chào mừng {user.displayName || "bạn"}, {greeting}
        </h1>

        <ChatArea
          className="w-full"
          input={input}
          setInput={setInput}
          handleKeyDown={handleKeyDown}
          handleSend={handleSend}
          isPending={isPending}
          disabled={isPending}
          placeholder="Hỏi bất kỳ điều gì"
        />
      </div>
    </div>
  )
}

export default ChatNew
