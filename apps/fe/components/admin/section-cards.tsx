import { Code, FileText, Users } from "lucide-react"

import type { StatsData } from "@/app/(admin)/dashboard/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SectionCardsProps {
  stats: StatsData
}

export function SectionCards({ stats }: SectionCardsProps) {
  return (
    <div className="grid gap-4 px-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
      <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
        <CardHeader className="pb-3">
          <CardTitle>Tổng quan hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[60px] text-xl leading-relaxed text-muted-foreground">
            Hệ thống đang hoạt động bình thường!
          </div>
        </CardContent>
      </Card>

      <Card x-chunk="dashboard-05-chunk-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.usersCount}</div>
          <p className="h-[20px] text-xs text-muted-foreground"></p>
        </CardContent>
      </Card>

      <Card x-chunk="dashboard-05-chunk-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Lượt Submit Code
          </CardTitle>
          <Code className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.submissionsCount}</div>
          <p className="h-[20px] text-xs text-muted-foreground"></p>
        </CardContent>
      </Card>

      <Card x-chunk="dashboard-05-chunk-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bài học Online</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeLessons}</div>
          <p className="h-[20px] text-xs text-muted-foreground"></p>
        </CardContent>
      </Card>
    </div>
  )
}
