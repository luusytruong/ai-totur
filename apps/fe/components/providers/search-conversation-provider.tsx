"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { getConversations, searchConversations } from "@/lib/actions/chat"
import { formatRelativeTime } from "@/lib/utils"
import { ConversationRow } from "@workspace/types"
import { Loader2, Search } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"
import { Item } from "../ui/item"

type SearchContextProps = {
  conversations: ConversationRow[]
  query: string
  results: ConversationRow[]
  isPending: boolean
  handleSearch: (searchQuery: string) => void
  toggleSearch: () => void
}

const SearchContext = React.createContext<SearchContextProps | null>(null)

function useSearch() {
  const context = React.useContext(SearchContext)
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider")
  }
  return context
}

function SearchProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = React.useState<ConversationRow[]>(
    []
  )
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<ConversationRow[]>([])
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    let ignore = false

    const loadConversations = async () => {
      try {
        const response = await getConversations()
        if (!ignore) {
          setConversations(response.data ?? [])
        }
      } catch {
        if (!ignore) {
          setConversations([])
        }
      }
    }

    void loadConversations()

    const handleCreated = (event: Event) => {
      const detail = (event as CustomEvent<ConversationRow>).detail
      setConversations((prev) => [
        detail,
        ...prev.filter((item) => item.id !== detail.id),
      ])
    }

    const handleTitleUpdated = (event: Event) => {
      const detail = (
        event as CustomEvent<{ conversationId: string; title: string }>
      ).detail
      setConversations((prev) =>
        prev.map((item) =>
          item.id === detail.conversationId
            ? { ...item, title: detail.title }
            : item
        )
      )
    }

    const handleUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ conversationId: string }>).detail
      setConversations((prev) => {
        const item = prev.find((i) => i.id === detail.conversationId)
        if (!item) return prev
        return [item, ...prev.filter((i) => i.id !== detail.conversationId)]
      })
    }

    const handleDeleted = (event: Event) => {
      const detail = (event as CustomEvent<{ conversationId: string }>).detail
      setConversations((prev) =>
        prev.filter((item) => item.id !== detail.conversationId)
      )
    }

    window.addEventListener("conversation-created", handleCreated)
    window.addEventListener("conversation-title-updated", handleTitleUpdated)
    window.addEventListener("conversation-updated", handleUpdated)
    window.addEventListener("conversation-deleted", handleDeleted)

    return () => {
      ignore = true
      window.removeEventListener("conversation-created", handleCreated)
      window.removeEventListener(
        "conversation-title-updated",
        handleTitleUpdated
      )
      window.removeEventListener("conversation-updated", handleUpdated)
      window.removeEventListener("conversation-deleted", handleDeleted)
    }
  }, [])

  const handleSearch = React.useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    startTransition(async () => {
      try {
        const response = await searchConversations(searchQuery)
        if (response.success && response.data) {
          setResults(response.data)
        }
      } catch (error) {
        console.error("Search failed:", error)
      }
    })
  }, [])

  const toggleSearch = React.useCallback(() => {
    setOpen((open) => !open)
  }, [])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, handleSearch])

  const contextValue = React.useMemo<SearchContextProps>(
    () => ({
      conversations,
      query,
      results,
      isPending,
      handleSearch,
      toggleSearch,
    }),
    [conversations, query, results, isPending, handleSearch, toggleSearch]
  )

  const displayList = query.trim() === "" ? conversations : results

  return (
    <SearchContext.Provider value={contextValue}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Tìm kiếm cuộc trò chuyện</DialogTitle>
            <DialogDescription>
              Nhập tên cuộc trò chuyện để tìm kiếm.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <InputGroup>
              <InputGroupInput
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <InputGroupAddon>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground" />
                )}
              </InputGroupAddon>
              {displayList.length > 0 && (
                <InputGroupAddon align="inline-end">
                  {displayList.length} kết quả
                </InputGroupAddon>
              )}
            </InputGroup>

            <div className="text-sm font-medium text-muted-foreground">
              {results.length > 0 ? "Kết quả tìm kiếm" : "Gần đây"}
            </div>

            <ScrollArea className="h-68">
              <div className="flex flex-col gap-2">
                {displayList.length === 0 &&
                  !isPending &&
                  query.trim() !== "" && (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      Không tìm thấy cuộc trò chuyện nào.
                    </p>
                  )}
                {displayList.length === 0 && query.trim() === "" && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Chưa có cuộc trò chuyện nào.
                  </p>
                )}
                {displayList.map((conv) => (
                  <Item key={conv.id} variant={"muted"} asChild>
                    <Link
                      href={`/${conv.id}`}
                      onClick={() => {
                        setOpen(false)
                      }}
                      // className="flex w-full items-center justify-between gap-3 rounded-[28px] p-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
                      className="justify-between"
                    >
                      <div className="truncate font-medium">{conv.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeTime(new Date(conv.createdAt))}
                      </div>
                    </Link>
                  </Item>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
      {children}
    </SearchContext.Provider>
  )
}

export { SearchProvider, useSearch }
