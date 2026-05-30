import { exerciseSubmissions, userAnalytics, userProgress } from '@workspace/types/db';
import { avg, count, eq, sql } from 'drizzle-orm';
import type { DrizzleDB } from '../../types.js';

export class ProgressService {
  constructor(private readonly db: DrizzleDB) {}

  async getUserProgress(userId: number) {
    return this.db.query.userProgress.findMany({
      where: eq(userProgress.userId, userId),
      with: {
        lesson: { columns: { id: true, title: true, topic: true } },
        exercise: { columns: { id: true, title: true } },
      },
    });
  }

  async getAnalytics(userId: number) {
    const analytics = await this.db.query.userAnalytics.findFirst({
      where: eq(userAnalytics.userId, userId),
      with: { user: { columns: { id: true, email: true, displayName: true, level: true } } },
    });

    const [stats] = await this.db
      .select({
        total: count(),
        passed: sql<number>`count(*) filter (where status = 'pass')`,
        failed: sql<number>`count(*) filter (where status = 'fail')`,
        avgRuntime: avg(exerciseSubmissions.runtimeMs),
      })
      .from(exerciseSubmissions)
      .where(eq(exerciseSubmissions.userId, userId));

    // Get last 30 days of activity
    const activity = await this.db
      .select({
        date: sql<string>`DATE(${exerciseSubmissions.submittedAt})`,
        count: count(),
      })
      .from(exerciseSubmissions)
      .where(
        sql`${exerciseSubmissions.userId} = ${userId} AND ${exerciseSubmissions.submittedAt} >= NOW() - INTERVAL '30 days'`,
      )
      .groupBy(sql`DATE(${exerciseSubmissions.submittedAt})`);

    // Get XP history (last 7 days)
    const xpHistory = await this.db
      .select({
        date: sql<string>`DATE(${exerciseSubmissions.submittedAt})`,
        xp: sql<number>`count(*) filter (where status = 'pass') * 50`, // Mock XP calculation: 50 XP per passed exercise
      })
      .from(exerciseSubmissions)
      .where(
        sql`${exerciseSubmissions.userId} = ${userId} AND ${exerciseSubmissions.submittedAt} >= NOW() - INTERVAL '7 days'`,
      )
      .groupBy(sql`DATE(${exerciseSubmissions.submittedAt})`)
      .orderBy(sql`DATE(${exerciseSubmissions.submittedAt})`);

    return {
      analytics,
      submissionStats: {
        total: Number(stats?.total ?? 0),
        passed: Number(stats?.passed ?? 0),
        failed: Number(stats?.failed ?? 0),
        passRate:
          Number(stats?.total ?? 0) > 0
            ? Math.round((Number(stats?.passed ?? 0) / Number(stats?.total ?? 1)) * 100)
            : 0,
        avgRuntimeMs: stats?.avgRuntime ? Math.round(Number(stats.avgRuntime)) : null,
      },
      activity: activity.map((a) => ({ date: a.date, count: Number(a.count) })),
      xpHistory: xpHistory.map((h) => ({ date: h.date, xp: Number(h.xp) })),
    };
  }
}
