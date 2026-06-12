import type { ExerciseSubmitResult, ExerciseWithLesson } from '@workspace/types';
import { exercises, exerciseSubmissions, lessons, userProgress } from '@workspace/types/db';
import { and, eq } from 'drizzle-orm';
import { CodeRunnerService } from '../../services/code-runner.service.js';
import type { DrizzleDB } from '../../types.js';
import { AnalyticsService } from '../analytics/analytics.service.js';
import type { SubmitCodeInput } from './exercises.schema.js';

type SubmitAction = 'none' | 'hint' | 'reroute';

export type SubmitResult = {
  action: SubmitAction;
  hint: string | null;
  suggestedLessonId: number | null;
  nextLessonSuggestion: null;
  shouldFetchNextLessonSuggestion: boolean;
  submission: {
    id: number;
    status: 'pass' | 'fail' | 'error';
    errorMsg: string | null;
    runtimeMs: number | null;
  };
  result: {
    status: 'pass' | 'fail' | 'error';
    runtimeMs: number;
    errorMsg: string | null;
    failedCaseIndex: number | null;
    stdout?: string;
  };
};

export class ExercisesService {
  private readonly codeRunner = new CodeRunnerService();
  private readonly analyticsService: AnalyticsService;

  constructor(private readonly db: DrizzleDB) {
    this.analyticsService = new AnalyticsService(db);
  }

  async getById(id: number): Promise<ExerciseWithLesson | null> {
    const exercise = await this.db.query.exercises.findFirst({
      where: eq(exercises.id, id),
      with: { lesson: { columns: { id: true, language: true } } },
    });

    if (!exercise) {
      return null;
    }

    return {
      ...exercise,
      lesson: exercise.lesson ?? null,
    };
  }

  private async countConsecutiveFails(userId: number, exerciseId: number): Promise<number> {
    const recent = await this.db.query.exerciseSubmissions.findMany({
      where: and(
        eq(exerciseSubmissions.userId, userId),
        eq(exerciseSubmissions.exerciseId, exerciseId),
      ),
      orderBy: (table, { desc }) => [desc(table.submittedAt)],
      limit: 10,
    });

    let streak = 0;
    for (const sub of recent) {
      if (sub.status === 'pass') break; // Ngắt streak nếu có kết quả pass
      if (sub.status === 'fail') streak++;
      // 'error' (cú pháp, runtime) sẽ không làm ngắt streak nhưng cũng không cộng thêm vào streak.
    }
    return streak;
  }

  async submit(
    exerciseId: number,
    userId: number,
    input: SubmitCodeInput,
  ): Promise<ExerciseSubmitResult> {
    const exercise = await this.getById(exerciseId);
    if (!exercise) throw new Error('Không tìm thấy bài tập');

    const codeResult = await this.codeRunner.runCode(
      input.code,
      exercise.lesson?.language ?? 'javascript',
      (exercise.testCases as Array<{ input: string; expected: string }>) || [],
    );

    const [submission] = await this.db
      .insert(exerciseSubmissions)
      .values({
        userId,
        exerciseId,
        code: input.code,
        status: codeResult.status,
        errorMsg: codeResult.errorMsg ?? null,
        runtimeMs: codeResult.runtimeMs,
      })
      .returning();

    if (!submission) throw new Error('Lỗi khi lưu submission');

    // Always return pass right away
    if (codeResult.status === 'pass') {
      await this.analyticsService.onSubmitPass(userId, exerciseId);
      const shouldFetchNextLessonSuggestion = exercise.lesson?.id
        ? await this.isLessonCompleted(userId, exercise.lesson.id)
        : false;

      return {
        action: 'none',
        hint: null,
        suggestedLessonId: null,
        nextLessonSuggestion: null,
        shouldFetchNextLessonSuggestion,
        submission: {
          id: submission.id,
          status: 'pass',
          errorMsg: null,
          runtimeMs: submission.runtimeMs,
        },
        result: codeResult,
      };
    }

    // Count consecutive fails for this exercise
    const failCount = await this.countConsecutiveFails(userId, exerciseId);

    if (failCount >= 3) {
      const errorType = codeResult.errorMsg
        ? this.extractErrorType(codeResult.errorMsg)
        : 'unknown_error';
      void this.analyticsService.onSubmitFail(userId, errorType).catch(() => {});

      return {
        action: 'reroute',
        hint: null,
        suggestedLessonId: exercise.prerequisiteLessonId ?? null,
        nextLessonSuggestion: null,
        shouldFetchNextLessonSuggestion: false,
        submission: {
          id: submission.id,
          status: submission.status,
          errorMsg: submission.errorMsg,
          runtimeMs: submission.runtimeMs,
        },
        result: codeResult,
      };
    }

    if (failCount === 2) {
      return {
        action: 'hint',
        hint: exercise.hint ?? 'Hãy kiểm tra lại logic của hàm và các điều kiện biên.',
        suggestedLessonId: null,
        nextLessonSuggestion: null,
        shouldFetchNextLessonSuggestion: false,
        submission: {
          id: submission.id,
          status: submission.status,
          errorMsg: submission.errorMsg,
          runtimeMs: submission.runtimeMs,
        },
        result: codeResult,
      };
    }

    return {
      action: 'none',
      hint: null,
      suggestedLessonId: null,
      nextLessonSuggestion: null,
      shouldFetchNextLessonSuggestion: false,
      submission: {
        id: submission.id,
        status: submission.status,
        errorMsg: submission.errorMsg,
        runtimeMs: submission.runtimeMs,
      },
      result: codeResult,
    };
  }

  private extractErrorType(errorMsg: string): string {
    const known = [
      'IndexError',
      'TypeError',
      'NameError',
      'ValueError',
      'SyntaxError',
      'AttributeError',
      'KeyError',
      'ZeroDivisionError',
    ];
    for (const e of known) {
      if (errorMsg.includes(e)) return e.toLowerCase();
    }
    return 'runtime_error';
  }

  private async isLessonCompleted(userId: number, lessonId: number): Promise<boolean> {
    const lesson = await this.db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      with: {
        exercises: {
          columns: { id: true },
        },
      },
    });

    if (!lesson || lesson.exercises.length === 0) return false;

    const completedExerciseIds = await this.db
      .select({ exerciseId: userProgress.exerciseId })
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.completionStatus, 'completed')));

    const completedSet = new Set(completedExerciseIds.map((row) => row.exerciseId));
    return lesson.exercises.every((exercise) => completedSet.has(exercise.id));
  }
}
