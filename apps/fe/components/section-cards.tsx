import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BookOpen, Code2, Trophy, Users } from "lucide-react"

export interface AdminStatsData {
  usersCount?: number
  activeLessons?: number
  exercisesCount?: number
  submissionsCount?: number
}

interface SectionCardsProps {
  stats: AdminStatsData
}

export function SectionCards({ stats }: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Người dùng</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {(stats.usersCount ?? 0).toLocaleString("vi-VN")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Users className="size-3.5" />
              Tổng
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tổng số tài khoản đăng ký
          </div>
          <div className="text-muted-foreground">Bao gồm admin và học viên</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Bài học</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {(stats.activeLessons ?? 0).toLocaleString("vi-VN")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <BookOpen className="size-3.5" />
              Online
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Bài học lập trình có sẵn
          </div>
          <div className="text-muted-foreground">
            Được phân loại theo ngôn ngữ & topic
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Bài tập</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {(stats.exercisesCount ?? 0).toLocaleString("vi-VN")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Code2 className="size-3.5" />
              Total
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tổng số bài tập trong hệ thống
          </div>
          <div className="text-muted-foreground">
            Có kèm test cases đánh giá code
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Lượt Nộp Bài</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {(stats.submissionsCount ?? 0).toLocaleString("vi-VN")}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Trophy className="size-3.5" />
              Tổng
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tổng lượt nộp code của học viên
          </div>
          <div className="text-muted-foreground">
            Bao gồm pass, fail và error
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
