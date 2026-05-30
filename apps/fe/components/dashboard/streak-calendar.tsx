"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
  subDays,
} from "date-fns"
import { Flame } from "lucide-react"
import { useMemo } from "react"

const WEEK_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

export function StreakCalendar({
  data,
}: {
  data?: Array<{ date: string; count: number }>
}) {
  const today = useMemo(() => new Date(), [])

  // Mở rộng khoảng thời gian để luôn bắt đầu từ Thứ 2 và kết thúc ở Chủ Nhật
  const calendarDays = useMemo(() => {
    const start = startOfWeek(subDays(today, 27), { weekStartsOn: 1 }) // 1 = Monday
    const end = endOfWeek(today, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [today])

  const { activityDays, currentStreak, totalDays } = useMemo(() => {
    if (!data || data.length === 0) {
      return { activityDays: [], currentStreak: 0, totalDays: 0 }
    }

    const parsedDays = data.map((d) => new Date(d.date))
    let streak = 0
    let checkDate = today
    while (parsedDays.some((d) => isSameDay(d, checkDate))) {
      streak++
      checkDate = subDays(checkDate, 1)
    }

    return {
      activityDays: parsedDays,
      currentStreak: streak,
      totalDays: parsedDays.length,
    }
  }, [data, today])

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold">Lịch hoạt động</CardTitle>
          <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2.5 py-1">
            <Flame className="size-3.5 text-orange-500" />
            <span className="text-xs font-bold text-orange-500">
              {currentStreak} ngày
            </span>
          </div>
        </div>
        <CardDescription className="text-xs">
          {totalDays} ngày hoạt động gần đây
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Day-of-week labels */}
        <div className="mb-1 grid grid-cols-7 gap-1 text-center">
          {WEEK_LABELS.map((d) => (
            <span key={d} className="text-[9px] text-muted-foreground">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date) => {
            const isActive = activityDays.some((d) => isSameDay(d, date))
            const isToday = isSameDay(date, today)

            return (
              <div
                key={date.toISOString()}
                title={format(date, "dd/MM/yyyy")}
                className={cn(
                  "aspect-square w-full rounded-sm transition-colors",
                  isActive ? "bg-orange-500" : "bg-muted/60 hover:bg-muted",
                  isToday && "ring-2 ring-primary ring-offset-1"
                )}
              />
            )
          })}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center justify-between text-[10px] text-muted-foreground">
          <span>27 ngày trước</span>
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-sm bg-muted/60" />
            <span>Không học</span>
            <span className="ml-1.5 inline-block size-2 rounded-sm bg-orange-500" />
            <span>Đã học</span>
          </div>
          <span>Hôm nay</span>
        </div>
        {totalDays === 0 && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Chưa có dữ liệu hoạt động thật.
          </p>
        )}
      </CardFooter>
    </Card>
  )
}
