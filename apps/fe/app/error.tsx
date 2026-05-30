"use client"

import { Button } from "@/components/ui/button"
import { Ghost, Home, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      {/* Background Decorations */}
      <div className="animate-pulse-slow pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />

      <div className="max-w-lg space-y-8 text-center">
        <div className="relative inline-block font-black">
          <div className="absolute -top-12 -right-12 animate-pulse text-primary/20">
            <Ghost size={80} strokeWidth={1} />
          </div>

          <h1 className="text-[12rem] leading-none italic opacity-10 select-none md:text-[16rem]">
            500
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="py-4 text-4xl leading-tight text-destructive uppercase italic md:text-6xl">
              ĐÃ CÓ LỖI XẢY RA!
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-lg text-muted-foreground italic">
            {error.message ||
              "Hệ thống gặp sự cố bất ngờ khi xử lý yêu cầu của bạn. Vui lòng thử tải lại trang hoặc quay lại sau."}
          </p>
          <div className="mx-auto h-1 w-32 rounded-full bg-primary/30" />
        </div>

        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="group h-12 px-6 tracking-tight uppercase shadow-xl shadow-primary/20 transition-transform hover:scale-105"
          >
            <Link href="/">
              <Home
                size={18}
                className="mr-2 transition-transform group-hover:-rotate-12"
              />
              Quay lại trang chủ
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-12 px-6 uppercase transition-all hover:bg-secondary/50"
            onClick={() => reset()}
          >
            <RotateCcw size={18} className="mr-2" />
            Thử lại ngay
          </Button>
        </div>
      </div>

      {error.digest && (
        <p className="mt-8 font-mono text-[10px] tracking-widest uppercase opacity-30">
          ID Lỗi: {error.digest}
        </p>
      )}

      {/* Floating Elements decoration */}
      <div className="fixed bottom-10 left-10 hidden -rotate-6 rounded-3xl border border-border/50 p-4 opacity-20 backdrop-blur-sm md:block">
        <span className="text-xs tracking-widest uppercase">
          Error_Code_500
        </span>
      </div>
      <div className="fixed top-10 right-10 hidden rotate-12 rounded-3xl border border-border/50 p-4 opacity-20 backdrop-blur-sm md:block">
        <span className="text-xs tracking-widest uppercase">Route_Error</span>
      </div>
    </div>
  )
}
