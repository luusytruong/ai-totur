"use client"

import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { ComponentPropsWithoutRef } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import {
  prism,
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism"
import remarkGfm from "remark-gfm"

const variants = {
  default: "prose-base",
  sm: "prose-sm",
  lg: "prose-lg",
}

function Message({
  content,
  variant = "default",
  className,
  children,
}: {
  content: string
  variant?: keyof typeof variants
  className?: string
  children?: React.ReactNode
}) {
  const { resolvedTheme } = useTheme()

  return (
    <div
      className={cn(
        "prose max-w-none leading-6 dark:prose-invert prose-pre:bg-transparent prose-pre:p-0",
        variants[variant],
        className
      )}
    >
      {children}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({
            inline,
            className,
            children,
            ...props
          }: ComponentPropsWithoutRef<"code"> & {
            inline?: boolean
          }) {
            const match = /language-(\w+)/.exec(className || "")
            if (!inline && match) {
              return (
                <SyntaxHighlighter
                  style={resolvedTheme === "light" ? prism : vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{ fontFamily: "var(--font-mono)" }}
                  codeTagProps={{ style: { fontFamily: "var(--font-mono)" } }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              )
            }
            return (
              <code
                className={cn("rounded-sm bg-muted px-0.5 py-0.5", className)}
                {...props}
              >
                {children}
              </code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default Message
