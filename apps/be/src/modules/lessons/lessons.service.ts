import type { LessonListItem, LessonRecommendation } from '@workspace/types';
import { exercises, lessons, userProgress, users } from '@workspace/types/db';
import { and, eq, SQL, sql } from 'drizzle-orm';
import type { Redis } from 'ioredis';
import { AiService } from '../../services/ai.service.js';
import type { DrizzleDB } from '../../types.js';
import type { CreateLessonInput, ListLessonsQuery } from './lessons.schema.js';

export class LessonsService {
  private readonly aiService = new AiService();

  constructor(
    private readonly db: DrizzleDB,
    private readonly redis?: Redis,
  ) {}

  private async getAllLessonsCached() {
    if (this.redis) {
      const cached = await this.redis.get('all_lessons_with_exercises');
      if (cached) {
        return JSON.parse(cached) as Array<LessonListItem & { exercises: Array<{ id: number }> }>;
      }
    }
    const allLessons = await this.db.query.lessons.findMany({
      orderBy: (lessons, { asc }) => [asc(lessons.id)],
      with: {
        exercises: { columns: { id: true } },
      },
    });
    if (this.redis) {
      this.redis
        .set('all_lessons_with_exercises', JSON.stringify(allLessons), 'EX', 300)
        .catch(() => {});
    }
    return allLessons;
  }

  async list(query: ListLessonsQuery, userId?: number) {
    const conditions: SQL[] = [];

    if (query.language && query.language !== 'all')
      conditions.push(eq(lessons.language, query.language));
    if (query.topic && query.topic !== 'all') conditions.push(eq(lessons.topic, query.topic));
    if (query.difficulty && query.difficulty !== 'all')
      conditions.push(eq(lessons.difficulty, query.difficulty));
    if (query.search) {
      conditions.push(sql`${lessons.title} ILIKE ${`%${query.search}%`}`);
    }

    const limit = query.limit;
    const offset = query.offset ?? (query.page - 1) * limit;

    const [results, countRes] = await Promise.all([
      this.db.query.lessons.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        orderBy: (lessons, { asc }) => [asc(lessons.id)],
        limit,
        offset,
        with: {
          exercises: {
            columns: { id: true },
          },
        },
      }),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(lessons)
        .where(conditions.length > 0 ? and(...conditions) : undefined),
    ]);

    const total = Number(countRes[0]?.count || 0);
    const totalPages = Math.ceil(total / limit);
    const meta = { total, page: query.page, limit, totalPages };

    if (!userId) {
      const items = results.map((l) => ({
        ...l,
        isRecommended: false,
        stats: {
          totalExercises: l.exercises.length,
          completedExercises: 0,
          isCompleted: false,
          isStarted: false,
          progress: 0,
        },
      }));
      return { items, meta };
    }

    const currentExerciseIds = results.flatMap((l) => l.exercises.map((e) => e.id));
    let completedIds = new Set<number>();

    if (currentExerciseIds.length > 0) {
      const userCompleted = await this.db
        .select({ exerciseId: userProgress.exerciseId })
        .from(userProgress)
        .where(
          and(eq(userProgress.userId, userId), eq(userProgress.completionStatus, 'completed')),
        );
      completedIds = new Set(userCompleted.map((p) => p.exerciseId as number));
    }

    const items = results.map((l) => {
      const completedCount = l.exercises.filter((ex) => completedIds.has(ex.id)).length;
      const totalEx = l.exercises.length;
      const progress = totalEx > 0 ? Math.round((completedCount / totalEx) * 100) : 0;

      return {
        ...l,
        isRecommended: false,
        stats: {
          totalExercises: totalEx,
          completedExercises: completedCount,
          isCompleted: totalEx > 0 && completedCount === totalEx,
          isStarted: completedCount > 0,
          progress,
        },
      };
    });

    return { items, meta };
  }

  async getById(id: number, userId?: number) {
    const lesson = await this.db.query.lessons.findFirst({
      where: eq(lessons.id, id),
      with: { exercises: true },
    });

    if (!lesson || !userId) return lesson;

    const userCompleted = await this.db
      .select({ exerciseId: userProgress.exerciseId })
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.completionStatus, 'completed')));

    const completedIds = new Set(userCompleted.map((p) => p.exerciseId));

    return {
      ...lesson,
      exercises: lesson.exercises.map((ex) => ({
        ...ex,
        isCompleted: completedIds.has(ex.id),
      })),
    };
  }

  async recommendNextLesson(
    userId: number,
    currentLessonId?: number,
  ): Promise<LessonRecommendation | null> {
    let currentLesson = null;
    if (currentLessonId) {
      currentLesson = await this.db.query.lessons.findFirst({
        where: eq(lessons.id, currentLessonId),
        columns: {
          id: true,
          title: true,
          language: true,
          topic: true,
          difficulty: true,
        },
      });
    }

    const userRow = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        level: true,
        displayName: true,
        preferredLanguage: true,
        recommendedLessonId: true,
      },
    });

    const lessonsListRes = await this.list({ limit: 1000, page: 1, offset: 0 }, userId);
    const lessonsList = lessonsListRes.items as LessonListItem[];
    let candidates = lessonsList.filter(
      (lesson) => lesson.id !== currentLessonId && !lesson.stats.isCompleted,
    );

    if (userRow?.preferredLanguage) {
      const prefLang = userRow.preferredLanguage.toLowerCase();
      const langCandidates = candidates.filter((l) => l.language.toLowerCase() === prefLang);
      if (langCandidates.length > 0) {
        candidates = langCandidates;
      }
    }

    if (candidates.length === 0) return null;

    const fallback = candidates.find((lesson) => lesson.isRecommended) ?? candidates[0] ?? null;
    if (!fallback) return null;

    if (userRow?.recommendedLessonId) {
      const cachedLesson = candidates.find((l) => l.id === userRow.recommendedLessonId);
      if (cachedLesson) {
        return this.toLessonRecommendation(cachedLesson, 'Dựa trên lộ trình học tập của bạn.');
      }
    }

    const completedLessons = lessonsList.filter((lesson) => lesson.stats.isCompleted);
    const completedLanguages = Array.from(new Set(completedLessons.map((l) => l.language)));
    const completedTopics = Array.from(new Set(completedLessons.map((l) => l.topic)));
    const completedExercises = lessonsList.reduce(
      (total, lesson) => total + lesson.stats.completedExercises,
      0,
    );
    const preferredLang = userRow?.preferredLanguage;

    const prompt = [
      'Hãy chọn MỘT bài học tiếp theo phù hợp nhất cho sinh viên từ danh sách ứng viên.',
      'Chỉ trả về JSON thuần theo đúng định dạng:',
      '{"lessonId": 123, "reason": "..."}',
      'Không thêm markdown, không thêm giải thích ngoài JSON.',
      '',
      `Profile:`,
      `- Name: ${userRow?.displayName ?? 'bạn'}`,
      `- Level: ${userRow?.level ?? 'beginner'}`,
      `- Preferred language: ${preferredLang ?? 'chưa chọn'}`,
      `- Completed lessons: ${completedLessons.length}/${lessonsList.length}`,
      `- Completed exercises: ${completedExercises}`,
      `- Languages already studied: ${completedLanguages.length > 0 ? completedLanguages.join(', ') : 'none (brand new student)'}`,
      `- Topics already mastered: ${completedTopics.length > 0 ? completedTopics.join(', ') : 'none'}`,
      '',
      `Current lesson completed: ${
        currentLesson
          ? `${currentLesson.title} (${currentLesson.language}, ${currentLesson.topic}, ${currentLesson.difficulty})`
          : 'None specific, user is in dashboard'
      }`,
      '',
      'Candidates:',
      ...candidates
        .slice(0, 20)
        .map(
          (lesson) =>
            `- ${lesson.id}: ${lesson.title} | ${lesson.language} | ${lesson.topic} | ${lesson.difficulty} | progress=${lesson.stats.progress}% | recommended=${lesson.isRecommended}`,
        ),
    ].join('\n');

    const response = await this.aiService.chat(
      'You are a curriculum recommender. Output only valid JSON.',
      [],
      prompt,
    );

    const parsed = this.parseLessonRecommendation(response.content, candidates);
    if (parsed) {
      await this.db
        .update(users)
        .set({ recommendedLessonId: parsed.id })
        .where(eq(users.id, userId));
      return parsed;
    }

    await this.db
      .update(users)
      .set({ recommendedLessonId: fallback.id })
      .where(eq(users.id, userId));
    return this.toLessonRecommendation(fallback, 'Dựa trên tiến độ hiện tại của bạn.');
  }

  async getStats(userId: number) {
    const totalLessons = await this.db.select({ count: sql<number>`count(*)` }).from(lessons);
    const totalExercises = await this.db.select({ count: sql<number>`count(*)` }).from(exercises);

    const userCompleted = await this.db
      .select({ exerciseId: userProgress.exerciseId })
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.completionStatus, 'completed')));

    const completedExerciseIds = new Set(userCompleted.map((p) => p.exerciseId));

    // Get all lessons with their exercises to calculate completed lessons
    const allLessons = await this.getAllLessonsCached();

    let completedLessons = 0;
    for (const l of allLessons) {
      if (l.exercises.length > 0 && l.exercises.every((ex) => completedExerciseIds.has(ex.id))) {
        completedLessons++;
      }
    }

    return {
      totalLessons: Number(totalLessons[0]?.count || 0),
      completedLessons,
      totalExercises: Number(totalExercises[0]?.count || 0),
      completedExercises: completedExerciseIds.size,
    };
  }

  async getUniqueTopics() {
    const results = await this.db.selectDistinct({ topic: lessons.topic }).from(lessons);
    return results.map((r) => r.topic);
  }

  async create(input: CreateLessonInput) {
    const [lesson] = await this.db.insert(lessons).values(input).returning();
    return lesson;
  }

  private parseLessonRecommendation(
    content: string,
    candidates: LessonListItem[],
  ): LessonRecommendation | null {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    try {
      const payload = JSON.parse(jsonMatch[0]) as { lessonId?: number; reason?: string };
      const lessonId = Number(payload.lessonId);
      if (!Number.isFinite(lessonId)) return null;

      const candidate = candidates.find((lesson) => lesson.id === lessonId);
      if (!candidate) return null;

      return this.toLessonRecommendation(candidate, payload.reason);
    } catch {
      return null;
    }
  }

  private toLessonRecommendation(lesson: LessonListItem, reason?: string): LessonRecommendation {
    const recommendation: LessonRecommendation = {
      id: lesson.id,
      title: lesson.title,
      language: lesson.language,
      topic: lesson.topic,
      difficulty: lesson.difficulty,
      contentMd: lesson.contentMd,
    };

    if (reason) {
      recommendation.reason = reason;
    }

    return recommendation;
  }
}
