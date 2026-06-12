import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Flame } from "lucide-react"

export interface LeaderboardUser {
  id: number
  name: string
  avatarInitials: string
  lessonsCompleted: number
  exercisesCompleted: number
  streakCount: number
}

interface StreakLeaderboardProps {
  users: LeaderboardUser[]
}

export function StreakLeaderboard({ users }: StreakLeaderboardProps) {
  // Sắp xếp theo streak cao -> thấp, lấy top 10
  const top = [...users]
    .sort((a, b) => b.streakCount - a.streakCount)
    .slice(0, 8)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="shrink-0">
        <CardTitle>Top Cày Cuốc 🔥</CardTitle>
        <CardDescription>BXH người dùng theo số ngày liên tiếp</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <ItemGroup>
          {top.map((user, index) => (
            <Item key={user.id} className="p-3">
              <ItemMedia variant="image">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-muted text-sm font-bold">
                  {user.avatarInitials}
                </div>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  <span className="mr-1 text-xs text-muted-foreground">
                    #{index + 1}
                  </span>
                  {user.name}
                </ItemTitle>
                <ItemDescription>
                  Bài học: {user.lessonsCompleted} | Bài tập:{" "}
                  {user.exercisesCompleted}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <div className="flex items-center gap-1 font-bold text-orange-500">
                  <Flame className="size-4" />
                  {user.streakCount}
                </div>
              </ItemActions>
            </Item>
          ))}
          {top.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Chưa có dữ liệu người dùng.
            </div>
          )}
        </ItemGroup>
      </CardContent>
    </Card>
  )
}
