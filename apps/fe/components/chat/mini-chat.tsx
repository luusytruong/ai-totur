"use client"

import ChatArea from "@/components/chat/chat-area"
import Message from "@/components/chat/message"
import { createConversation } from "@/lib/actions/chat"
import { streamConversationMessage } from "@/lib/chat-stream"
import type { MessageRow } from "@workspace/types/db"
import { Bot } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

let _idCounter = 0
function nextId(): number {
  return --_idCounter
}

function createLocalMessage(
  conversationId: string,
  role: MessageRow["role"],
  content: string
): MessageRow {
  return {
    id: nextId(),
    conversationId,
    role,
    content,
    tokensUsed: 0,
    createdAt: new Date(),
  }
}

export function MiniChat({
  currentCode,
  exerciseId,
  lastError,
  autoStartPrompt,
  onAutoStartClear,
}: {
  currentCode: string
  exerciseId?: number
  lastError?: string | null
  autoStartPrompt?: string | null
  onAutoStartClear?: () => void
}) {
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const autoStartConsumed = useRef(false)
  const conversationCreatePromise = useRef<Promise<string> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const ensureConversation = useCallback(async () => {
    if (conversationId) return conversationId

    if (!conversationCreatePromise.current) {
      conversationCreatePromise.current = createConversation()
        .then((res) => {
          const data = res as { data: { id: string } }
          setConversationId(data.data.id)
          return data.data.id
        })
        .catch((error) => {
          conversationCreatePromise.current = null
          throw error
        })
    }

    try {
      return await conversationCreatePromise.current
    } catch {
      toast.error("Không thể khởi tạo chat AI")
      return null
    }
  }, [conversationId])

  const sendMessage = useCallback(
    async (text: string, isAuto = false) => {
      if (!text.trim() || isStreaming) return

      const activeConversationId = await ensureConversation()
      if (!activeConversationId) return

      const userMsg = createLocalMessage(activeConversationId, "user", text)
      const assistMsg = createLocalMessage(
        activeConversationId,
        "assistant",
        ""
      )

      setMessages((prev) => [...prev, userMsg, assistMsg])
      setInput("")
      setIsStreaming(true)

      try {
        await streamConversationMessage(
          activeConversationId,
          text,
          {
            onToken: (chunk) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistMsg.id
                    ? { ...m, content: m.content + chunk }
                    : m
                )
              )
            },
            onDone: (full) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistMsg.id ? { ...m, content: full } : m
                )
              )
            },
            onTitleUpdated: () => {},
            onError: (msg) => {
              throw new Error(msg)
            },
          },
          {
            exerciseId,
            currentCode,
            lastError: isAuto ? lastError : null,
          }
        )
      } catch {
        setMessages((prev) =>
          prev.filter((m) => m.id !== assistMsg.id && m.id !== userMsg.id)
        )
        toast.error("Lỗi khi chat với AI")
      } finally {
        setIsStreaming(false)
        if (isAuto && onAutoStartClear) onAutoStartClear()
      }
    },
    [
      isStreaming,
      ensureConversation,
      currentCode,
      exerciseId,
      lastError,
      onAutoStartClear,
    ]
  )

  // Auto scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Kích hoạt hỏi tự động khi có autoStartPrompt mới (đính kèm lỗi)
  // Dùng ref guard để tránh gọi lại khi sendMessage thay đổi reference
  useEffect(() => {
    autoStartConsumed.current = false
  }, [autoStartPrompt])

  useEffect(() => {
    if (!autoStartPrompt) return
    if (autoStartConsumed.current) return
    autoStartConsumed.current = true
    const msg = autoStartPrompt
    sendMessage(msg, true)
  }, [autoStartPrompt, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Bot className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Gia sư AI đang chờ</p>
              <p className="mx-10 mt-1 text-xs text-muted-foreground">
                Đặt câu hỏi về bài tập hoặc code của bạn. Khi submit sai, AI sẽ
                tự động gợi ý.
              </p>
            </div>
          </div>
        )}

        <div className="min-h-50 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" ? (
                <div className="w-full max-w-full">
                  <Message content={msg.content} variant="sm" />
                  {isStreaming && msg.content === "" && (
                    <span className="mt-1 inline-flex gap-1 px-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </span>
                  )}
                </div>
              ) : (
                <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-2.5 text-sm text-foreground">
                  {msg.content}
                </div>
              )}
            </div>
          ))}
        </div>
        <div ref={scrollRef} />
      </div>

      {/* Input area */}
      <div className="relative px-4 pb-4">
        <ChatArea
          size="sm"
          input={input}
          setInput={setInput}
          handleKeyDown={handleKeyDown}
          handleSend={() => sendMessage(input)}
          isPending={isStreaming}
          disabled={isStreaming}
          placeholder="Hỏi về bài tập hoặc code của bạn..."
          className=""
        />
      </div>
    </div>
  )
}
