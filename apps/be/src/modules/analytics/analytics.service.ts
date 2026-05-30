import type { UserLevel } from '@workspace/types/db';
import { exerciseSubmissions, userAnalytics, userProgress } from '@workspace/types/db';
import { count, eq, sql } from 'drizzle-orm';
import type { DrizzleDB } from '../../types.js';

const LEVEL_UP_PASS_RATE_THRESHOLD = 0.8; // 80% pass rate → level up

type LevelOrder = Record<UserLevel, number>;
const LEVEL_ORDER: LevelOrder = { beginner: 0, intermediate: 1, advanced: 2 };
const LEVEL_NAMES: UserLevel[] = ['beginner', 'intermediate', 'advanced'];

export class AnalyticsService {
  constructor(private readonly db: DrizzleDB) {}

  async onSubmitPass(userId: number, exerciseId: number): Promise<void> {
    // Add lesson topic to knownTopics
    const exercise = await this.db.query.exercises
      .findFirst({
        where: eq(userProgress.id, exerciseId),
        with: { lesson: { columns: { topic: true } } },
      })
      .catch(() => null);

    const topic = exercise?.lesson?.topic;

    const existing = await this.db.query.userAnalytics.findFirst({
      where: eq(userAnalytics.userId, userId),
    });

    if (!existing) {
      await this.db.insert(userAnalytics).values({
        userId,
        knownTopics: topic ? [topic] : [],
      });
    } else if (topic) {
      const known = (existing.knownTopics as string[]) ?? [];
      if (!known.includes(topic)) {
        await this.db
          .update(userAnalytics)
          .set({ knownTopics: [...known, topic] })
          .where(eq(userAnalytics.userId, userId));
      }
    }

    // Mark userProgress as complete
    const existingProgress = await this.db.query.userProgress.findFirst({
      where: sql`${userProgress.userId} = ${userId} AND ${userProgress.exerciseId} = ${exerciseId}`,
    });

    if (existingProgress) {
      await this.db
        .update(userProgress)
        .set({ completionStatus: 'completed', score: 100 })
        .where(eq(userProgress.id, existingProgress.id));
    } else {
      await this.db.insert(userProgress).values({
        userId,
        exerciseId,
        completionStatus: 'completed',
        score: 100,
      });
    }

    await this.onLevelUp(userId);
  }

  async onSubmitFail(userId: number, errorType: string): Promise<void> {
    const existing = await this.db.query.userAnalytics.findFirst({
      where: eq(userAnalytics.userId, userId),
    });

    if (!existing) {
      await this.db.insert(userAnalytics).values({
        userId,
        errorPatterns: { [errorType]: 1 },
      });
    } else {
      const patterns = (existing.errorPatterns as Record<string, number>) ?? {};
      patterns[errorType] = (patterns[errorType] ?? 0) + 1;
      await this.db
        .update(userAnalytics)
        .set({ errorPatterns: patterns })
        .where(eq(userAnalytics.userId, userId));
    }
  }

  async onLevelUp(userId: number): Promise<void> {
    const analytics = await this.db.query.userAnalytics.findFirst({
      where: eq(userAnalytics.userId, userId),
      with: {
        user: {
          columns: { level: true },
        },
      },
    });
    if (!analytics) return;

    const currentLevel: UserLevel = analytics.user?.level ?? 'beginner';
    const currentOrder = LEVEL_ORDER[currentLevel];
    if (currentOrder >= 2) return; // already advanced

    const [stats] = await this.db
      .select({
        total: count(),
        passed: sql<number>`count(*) filter (where status = 'pass')`,
      })
      .from(exerciseSubmissions)
      .where(eq(exerciseSubmissions.userId, userId));

    const total = Number(stats?.total ?? 0);
    const passed = Number(stats?.passed ?? 0);
    if (total < 5) return; // need at least 5 submissions to upgrade

    const passRate = passed / total;
    if (passRate >= LEVEL_UP_PASS_RATE_THRESHOLD) {
      const nextLevel = LEVEL_NAMES[currentOrder + 1];
      if (nextLevel) {
        await this.db
          .update(userAnalytics)
          .set({ levelEstimate: nextLevel })
          .where(eq(userAnalytics.userId, userId));
      }
    }
  }
}
