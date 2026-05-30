"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { apiClient } from "@/lib/api/apiClient"
import { cn } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ProfileResponse } from "@workspace/types"
import { useState } from "react"
import { Badge } from "../ui/badge"
import { Item, ItemContent, ItemFooter, ItemMedia } from "../ui/item"

const LANGUAGES = [
  {
    id: "python",
    name: "Python",
    emoji: "🐍",
    usecases: "AI/ML, Data Science, tự động hoá",
    domains: ["Data Science", "Máy học", "Backend", "Tự động hoá"],
  },
  {
    id: "javascript",
    name: "JavaScript",
    emoji: "🟨",
    usecases: "Web, App, Backend (Node.js)",
    domains: ["Frontend", "Backend", "Mobile (React Native)", "Full-stack"],
  },
  {
    id: "java",
    name: "Java",
    emoji: "☕",
    usecases: "Enterprise, Android, Backend hệ thống lớn",
    domains: ["Android", "Enterprise", "Backend doanh nghiệp"],
  },
  {
    id: "cpp",
    name: "C++",
    emoji: "⚙️",
    usecases: "Lập trình hệ thống, Game, nhúng",
    domains: ["Game dev", "Hệ thống nhúng", "Hiệu suất cao", "Competitive"],
  },
]

interface Props {
  open: boolean
  onClose: (selectedLanguage: string) => void
}

export function LanguageOnboardingDialog({ open, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: (language: string) =>
      apiClient.patch<ProfileResponse>("/users/me", {
        body: JSON.stringify({ preferredLanguage: language }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] })
      onClose(selected!)
    },
  })

  const handleConfirm = () => {
    if (!selected) return
    mutate(selected)
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Chào mừng bạn! 🎉</DialogTitle>
          <DialogDescription>
            Bạn muốn bắt đầu học ngôn ngữ lập trình nào? Hệ thống sẽ gợi ý bài
            học phù hợp cho bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 grid grid-cols-2 gap-3">
          {LANGUAGES.map((lang) => (
            <Item
              key={lang.id}
              onClick={() => setSelected(lang.id)}
              className={cn(
                "flex-col border border-border/60 transition-all duration-200",
                selected === lang.id && "border-primary shadow-md"
              )}
            >
              <ItemMedia>
                <div className="mb-2 text-2xl">{lang.emoji}</div>
              </ItemMedia>
              <ItemContent>
                <div className="font-semibold">{lang.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {lang.usecases}
                </div>
              </ItemContent>
              <ItemFooter className="flex-0">
                <div className="mt-2 flex flex-wrap gap-1">
                  {lang.domains.map((d) => (
                    <Badge
                      key={d}
                      variant="outline"
                      className="h-5 text-[10px]"
                    >
                      {d}
                    </Badge>
                  ))}
                </div>
              </ItemFooter>
            </Item>
          ))}
        </div>

        <Button
          className="mt-4 w-full"
          disabled={!selected || isPending}
          onClick={handleConfirm}
        >
          {isPending ? "Đang lưu..." : "Bắt đầu học →"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
