"use client"

import { cn } from "@/lib/utils"
import { ArrowUp } from "lucide-react"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"

type ChatAreaProps = {
  input: string
  setInput: (input: string) => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  handleSend: () => void
  isPending: boolean
  className?: string
  disabled?: boolean
  placeholder?: string
  size?: "default" | "sm"
}

function ChatArea({
  input,
  setInput,
  handleKeyDown,
  handleSend,
  isPending,
  className,
  disabled = false,
  placeholder = "Hỏi bất kỳ điều gì",
  size = "default",
}: ChatAreaProps) {
  return (
    <div
      className={cn(
        "relative mx-auto flex min-h-14 w-full max-w-2xl items-end gap-2 overflow-hidden rounded-[28px] border bg-background shadow-lg lg:max-w-3xl",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 z-10 rounded-[28px] [box-shadow:inset_0_0_6px_4px_var(--background)]"></div>
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "no-scrollbar max-h-60 min-h-6 flex-1 resize-none border-0 bg-transparent! py-4 pl-6 leading-6 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-80",
          size === "sm" ? "text-sm!" : "text-base!"
        )}
        rows={1}
        autoFocus
      />
      <div className="py-2.5 pr-2.5">
        <Button
          size="icon"
          className="h-9 w-9 shrink-0 rounded-full"
          disabled={disabled || !input.trim() || isPending}
          onClick={handleSend}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default ChatArea
