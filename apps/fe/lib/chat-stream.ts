"use client"

import { getClientToken } from "@/lib/api/apiClient"
import { buildHeaders } from "@/lib/api/core"

type StreamHandlers = {
  onToken?: (chunk: string) => void
  onDone?: (response: string) => void
  onError?: (message: string) => void
  onTitleUpdated?: (title: string) => void
}

type StreamContext = {
  exerciseId?: number
  currentCode?: string
  lastError?: string | null
}

export async function streamConversationMessage(
  conversationId: string,
  message: string,
  handlers: StreamHandlers,
  context?: StreamContext
) {
  const token = getClientToken()
  const body = JSON.stringify({
    content: message,
    context,
  })

  const response = await fetch(
    `/api/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: buildHeaders(token, body),
      credentials: "include",
      body,
    }
  )

  if (!response.ok || !response.body) {
    throw new Error("Không thể bắt đầu stream hội thoại")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  const processEvent = (rawEvent: string) => {
    const lines = rawEvent.split("\n")
    const event = lines
      .find((line) => line.startsWith("event:"))
      ?.slice(6)
      .trim()
    const dataLine = lines
      .find((line) => line.startsWith("data:"))
      ?.slice(5)
      .trim()
    if (!event || !dataLine) return

    const payload = JSON.parse(dataLine) as
      | { type: "token"; chunk: string }
      | { type: "done"; response: string }
      | { type: "error"; message: string }
      | { type: "titleUpdated"; title: string }

    if (event === "token" && payload.type === "token") {
      handlers.onToken?.(payload.chunk)
      return
    }

    if (event === "done" && payload.type === "done") {
      handlers.onDone?.(payload.response)
      return
    }

    if (event === "titleUpdated" && payload.type === "titleUpdated") {
      handlers.onTitleUpdated?.(payload.title)
      return
    }

    if (event === "error" && payload.type === "error") {
      handlers.onError?.(payload.message)
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done })

    let separatorIndex = buffer.indexOf("\n\n")
    while (separatorIndex !== -1) {
      const rawEvent = buffer.slice(0, separatorIndex).trim()
      buffer = buffer.slice(separatorIndex + 2)
      if (rawEvent) {
        processEvent(rawEvent)
      }
      separatorIndex = buffer.indexOf("\n\n")
    }

    if (done) {
      break
    }
  }
}
