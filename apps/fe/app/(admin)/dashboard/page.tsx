import {
  DailySubmissions,
  DashboardCharts,
} from "@/components/admin/dashboard-charts"
import {
  LeaderboardUser,
  StreakLeaderboard,
} from "@/components/admin/streak-leaderboard"
import { SectionCards } from "@/components/section-cards"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiServer } from "@/lib/api/apiServer"

export const metadata = {
  title: "Tổng quan",
}

export interface StatsData {
  usersCount: number
  submissionsCount: number
  activeLessons: number
  exercisesCount: number
  status: string
  dailyMessages?: { date: string; user: number; assistant: number }[]
  dailySubmissions?: DailySubmissions[]
  topUsersList?: LeaderboardUser[]
}

export default async function Page() {
  const response = await apiServer.get<{ data: StatsData }>("/admin/reports")
  const stats = response.data

  return (
    <ScrollArea className="h-full">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6">
          <SectionCards
            stats={{
              usersCount: stats.usersCount,
              activeLessons: stats.activeLessons,
              exercisesCount: stats.exercisesCount,
              submissionsCount: stats.submissionsCount,
            }}
          />
          <div className="px-4">
            {/* Layout 3/4 Charts | 1/4 Leaderboard */}
            <div className="flex flex-col gap-4 xl:flex-row xl:items-stretch">
              <div className="w-full xl:w-3/4">
                <DashboardCharts
                  dailyMessages={stats.dailyMessages ?? []}
                  dailySubmissions={stats.dailySubmissions ?? []}
                />
              </div>
              <div className="w-full xl:w-1/4">
                <StreakLeaderboard users={stats.topUsersList ?? []} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
