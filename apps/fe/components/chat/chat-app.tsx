"use client"

import ChatArea from "@/components/chat/chat-area"
import { getConversation, getSharedConversation } from "@/lib/actions/chat"
import { streamConversationMessage } from "@/lib/chat-stream"
import { cn } from "@/lib/utils"
import { titleStore } from "@/store/title-store"
import { MessageRow } from "@workspace/types/db"
import { Copy, Flag } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import Message from "./message"

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const SCROLL_THRESHOLD_PX = 80
const USER_SCROLL_DEBOUNCE_MS = 150

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatApp({
  conversationId,
  readOnly = false,
}: {
  conversationId: string
  readOnly?: boolean
}) {
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)

  const { setTitle } = titleStore()

  /**
   * autoScroll: whether we should keep the view pinned to the bottom.
   * Becomes false when the user scrolls up; snaps back to true when they
   * scroll back to the bottom or send a new message.
   */
  const [autoScroll, setAutoScroll] = useState(true)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollAnchorRef = useRef<HTMLDivElement>(null)
  const userScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const isUserScrollingRef = useRef(false)

  /**
   * Tracks whether the pending-message from sessionStorage has already been
   * consumed so that Strict Mode double-invocation doesn't send it twice.
   */
  const pendingConsumedRef = useRef(false)

  const router = useRouter()

  // ── Core send ──────────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isStreaming) return

      const userMessage = createLocalMessage(
        conversationId,
        "user",
        messageText
      )
      const assistantMessage = createLocalMessage(
        conversationId,
        "assistant",
        ""
      )

      setMessages((prev) => [...prev, userMessage, assistantMessage])
      setInput("")

      // Snap back to bottom whenever the user (or the app) sends a message.
      isUserScrollingRef.current = false
      setAutoScroll(true)

      setIsStreaming(true)

      try {
        await streamConversationMessage(conversationId, messageText, {
          onToken: (chunk) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              )
            )
          },
          onDone: (fullResponse) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: fullResponse }
                  : msg
              )
            )
            window.dispatchEvent(
              new CustomEvent("conversation-updated", {
                detail: { conversationId },
              })
            )
          },
          onTitleUpdated: (title) => {
            window.dispatchEvent(
              new CustomEvent("conversation-title-updated", {
                detail: { conversationId, title },
              })
            )
          },
          onError: (message) => {
            throw new Error(message)
          },
        })
      } catch (error) {
        // Roll back both the user message and the empty assistant placeholder.
        setMessages((prev) =>
          prev.filter(
            (msg) => msg.id !== assistantMessage.id && msg.id !== userMessage.id
          )
        )
        toast.error(
          error instanceof Error ? error.message : "Không thể gửi tin nhắn"
        )
      } finally {
        setIsStreaming(false)
      }
    },

    [conversationId, isStreaming]
  )

  // ── Init: load history or consume pending message ──────────────────────────

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const pendingKey = `pending-chat:${conversationId}`
      const pending = sessionStorage.getItem(pendingKey)

      // Consume the pending message exactly once (guard against Strict Mode).
      if (pending && !pendingConsumedRef.current) {
        pendingConsumedRef.current = true
        sessionStorage.removeItem(pendingKey)

        try {
          const parsed = JSON.parse(pending) as { message?: string }
          if (parsed.message?.trim()) {
            void sendMessage(parsed.message.trim())
          }
        } catch {
          // Malformed JSON — silently discard.
        }

        // Skip fetching history: the conversation may not exist on the server yet.
        return
      }

      // If the pending message was already consumed (Strict Mode second mount),
      // the stream is already in flight — nothing to do.
      if (pendingConsumedRef.current) return

      // Normal path: load existing conversation from server.
      try {
        const response = readOnly
          ? await getSharedConversation(conversationId)
          : await getConversation(conversationId)

        if (!cancelled) {
          setMessages(response.data?.messages ?? [])
          const title = response.data?.title || "Untitled"
          document.title = title
          setTitle(title)
          setIsDisabled(!!response.data?.isDisabled || readOnly)
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Không thể tải cuộc hội thoại"
          )
          router.push("/")
        }
      }
    }

    void init()

    return () => {
      cancelled = true
    }
    // sendMessage is stable thanks to useCallback; conversationId identifies
    // the conversation being initialised.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, readOnly])

  // ── Scroll: detect user-initiated scroll ──────────────────────────────────

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const markUserScrolling = () => {
      isUserScrollingRef.current = true

      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current)
      }
      userScrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false
      }, USER_SCROLL_DEBOUNCE_MS)
    }

    container.addEventListener("wheel", markUserScrolling, { passive: true })
    container.addEventListener("touchmove", markUserScrolling, {
      passive: true,
    })

    return () => {
      container.removeEventListener("wheel", markUserScrolling)
      container.removeEventListener("touchmove", markUserScrolling)
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current)
      }
    }
  }, [])

  // ── Scroll: auto-scroll to bottom when new content arrives ────────────────

  useEffect(() => {
    if (!autoScroll || isUserScrollingRef.current) return
    scrollAnchorRef.current?.scrollIntoView({ behavior: "auto" })
  }, [messages, autoScroll])

  // ── Scroll: update autoScroll state based on scroll position ──────────────

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isAtBottom =
      scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD_PX

    setAutoScroll(isAtBottom)
  }, [])

  // ── Input handlers ─────────────────────────────────────────────────────────

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || isStreaming) return
    void sendMessage(text)
  }, [input, isStreaming, sendMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  const lastMessageId = messages[messages.length - 1]?.id

  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div className="flex h-full flex-col">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4"
        >
          <div className="mx-auto max-w-3xl space-y-8 pt-10 pb-22">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex flex-col")}>
                {/* Hidden label for screen readers */}
                <span className="size-0 opacity-0">
                  {m.role === "user" ? "Bạn:" : "AI:"}
                </span>
                <div
                  className={cn(
                    m.role === "user" &&
                      "ml-auto max-w-[85%] rounded-[22px] bg-muted px-4 py-2.5"
                  )}
                >
                  <Message content={m.content}>
                    {/* Label for AI reasoning */}
                    {!m.content && isStreaming && m.id === lastMessageId && (
                      <div className="flex animate-pulse items-center gap-2">
                        <span className="ml-1 inline-block h-3 w-3 bg-primary align-middle" />
                        <span className="text-sm text-muted-foreground">
                          Đang suy nghĩ{dots}
                        </span>
                      </div>
                    )}
                  </Message>
                </div>

                {!isStreaming && m.role === "assistant" && (
                  <div className="mt-4 mb-6 -ml-3 flex items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="size-9 justify-center px-0"
                          variant="ghost"
                          onClick={async () => {
                            await navigator.clipboard.writeText(m.content)
                            toast.success("Đã sao chép")
                          }}
                        >
                          <Copy />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Sao chép</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="size-9 justify-center px-0"
                          variant="ghost"
                          onClick={() => {
                            // TODO: implement report
                          }}
                        >
                          <Flag />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Báo cáo nội dung</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            ))}

            {/* Scroll anchor — always kept at the very bottom of the list */}
            <div ref={scrollAnchorRef} />
          </div>
        </div>
      </div>
      {!readOnly && (
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background via-background p-4">
          <ChatArea
            input={input}
            setInput={setInput}
            handleKeyDown={handleKeyDown}
            handleSend={handleSend}
            isPending={isStreaming}
            disabled={isDisabled}
            placeholder={
              isDisabled
                ? "Chuyên mục này không còn tài liệu."
                : "Hỏi bất kỳ điều gì"
            }
          />
          <div className="mt-3 text-center text-xs font-medium text-muted-foreground">
            AI có thể mắc lỗi. Vui lòng kiểm tra lại thông tin quan trọng.
          </div>
        </div>
      )}
    </>
  )
}
