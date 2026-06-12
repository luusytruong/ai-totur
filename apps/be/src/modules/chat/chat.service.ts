import type { UserLevel } from '@workspace/types/db';
import {
  conversations,
  exercises,
  messages,
  userAnalytics,
  userProgress,
  users,
} from '@workspace/types/db';
import { and, asc, desc, eq, ilike } from 'drizzle-orm';
import { AiService } from '../../services/ai.service.js';
import type { DrizzleDB } from '../../types.js';
import type { CreateConversationInput, SendMessageInput } from './chat.schema.js';

type MessageRow = { role: string; content: string };

type PromptProfile = {
  name: string;
  level: UserLevel;
  preferredLanguage: string | null;
  languages: string[];
  knownTopics: string[];
  errorPatterns: Array<{ name: string; count: number }>;
  completedLessons: number;
  totalLessons: number;
  completedExercises: number;
  recentSummary: string;
  strategy: string;
};

type ExercisePromptContext = {
  exerciseId?: number | undefined;
  currentCode?: string | undefined;
  lastError?: string | null | undefined;
};

export class ChatService {
  private readonly aiService: AiService;

  constructor(private readonly db: DrizzleDB) {
    this.aiService = new AiService();
  }

  async createConversation(userId: number, input: CreateConversationInput) {
    const [conv] = await this.db
      .insert(conversations)
      .values({ userId, title: input.title ?? 'New conversation' })
      .returning();
    return conv;
  }

  async getConversations(userId: number) {
    return this.db.query.conversations.findMany({
      where: and(eq(conversations.userId, userId), eq(conversations.isDisabled, false)),
      orderBy: [desc(conversations.updatedAt)],
    });
  }

  async searchConversations(userId: number, query: string) {
    return this.db.query.conversations.findMany({
      where: and(
        eq(conversations.userId, userId),
        eq(conversations.isDisabled, false),
        ilike(conversations.title, `%${query}%`),
      ),
      orderBy: [desc(conversations.updatedAt)],
    });
  }

  async deleteConversation(conversationId: string, userId: number) {
    const [conversation] = await this.db
      .update(conversations)
      .set({ isDisabled: true, updatedAt: new Date() })
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
      .returning();

    return conversation ?? null;
  }

  async makeConversationPublic(conversationId: string, userId: number) {
    const [conversation] = await this.db
      .update(conversations)
      .set({ isPublic: true, updatedAt: new Date() })
      .where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
      .returning();

    if (!conversation) return null;

    return {
      conversation,
      publicUrl: `/shared/${conversation.id}`,
    };
  }

  private async updateConversationTitleFromFirstMessage(
    conversationId: string,
    firstMessage: string,
    onTitleUpdated?: (payload: { conversationId: string; title: string }) => void | Promise<void>,
  ): Promise<{ inTokens: number; outTokens: number }> {
    const {
      title: generatedTitle,
      inTokens,
      outTokens,
    } = await this.aiService.generateConversationTitle(firstMessage);
    const title = generatedTitle || 'New conversation';

    await this.db.update(conversations).set({ title }).where(eq(conversations.id, conversationId));

    if (onTitleUpdated) {
      await onTitleUpdated({ conversationId, title });
    }

    return { inTokens, outTokens };
  }

  async getHistory(conversationId: string, userId: number) {
    const conv = await this.db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
      with: { messages: { orderBy: [asc(messages.createdAt)] } },
    });
    if (!conv || conv.userId !== userId || conv.isDisabled) return null;
    return conv;
  }

  async getSharedHistory(conversationId: string) {
    const conv = await this.db.query.conversations.findFirst({
      where: and(eq(conversations.id, conversationId), eq(conversations.isPublic, true)),
      with: { messages: { orderBy: [asc(messages.createdAt)] } },
    });
    if (!conv || conv.isDisabled) return null;
    return conv;
  }

  private shortenText(text: string, limit = 120): string {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (!normalized) return '';
    return normalized.length > limit ? `${normalized.slice(0, limit - 1).trimEnd()}…` : normalized;
  }

  private buildRecentSummary(history: MessageRow[]): string {
    const recent = history.slice(-6);
    if (recent.length === 0) return 'Chưa có lịch sử hội thoại gần đây.';

    const segments: string[] = [];
    for (let index = 0; index < recent.length; index += 2) {
      const userMessage = recent[index];
      const assistantMessage = recent[index + 1];
      if (!userMessage) continue;
      const userSnippet = this.shortenText(userMessage.content, 80);
      const assistantSnippet = assistantMessage
        ? this.shortenText(assistantMessage.content, 90)
        : '';

      if (!userSnippet && !assistantSnippet) continue;

      segments.push(
        assistantSnippet
          ? `SV hỏi: ${userSnippet}; AI đã gợi ý: ${assistantSnippet}`
          : `SV hỏi: ${userSnippet}`,
      );
    }

    return segments.slice(-3).join(' | ') || 'Chưa có lịch sử hội thoại gần đây.';
  }

  private buildStrategy(level: UserLevel, profile: Omit<PromptProfile, 'strategy'>): string {
    const weakAreaNames = profile.errorPatterns.map((item) => item.name);
    const focusHints: string[] = [];

    if (weakAreaNames.some((name) => /syntax|parse/i.test(name))) {
      focusHints.push(
        'Ưu tiên soi lỗi cú pháp từng dòng, chỉ ra vị trí dễ sai và yêu cầu SV tự sửa trước khi đưa thêm gợi ý.',
      );
    }

    if (weakAreaNames.some((name) => /runtime|exception|error/i.test(name))) {
      focusHints.push(
        'Nhắc kiểm tra input, edge cases và traceback trước khi nghĩ đến tối ưu hoá.',
      );
    }

    if (profile.knownTopics.length > 0) {
      focusHints.push(`Neo vào kiến thức đã biết: ${profile.knownTopics.slice(0, 4).join(', ')}.`);
    }

    const sharedRules =
      'Luôn dạy theo Socratic method, không đưa lời giải hoàn chỉnh ngay, và chỉ dùng tối đa 3 bước mỗi lần.';

    if (level === 'beginner') {
      return [
        'Dùng phép tương đồng gần gũi với đời sống.',
        'Dẫn dắt qua từng bước rất nhỏ, mỗi lần tối đa 3 bước.',
        'Nhiều câu hỏi ngắn để SV tự khám phá.',
        'Khích lệ nhiều, tránh thuật ngữ nặng nếu chưa cần.',
        sharedRules,
        ...focusHints,
      ].join(' ');
    }

    if (level === 'intermediate') {
      return [
        'Bridge từ kiến thức SV đã biết sang khái niệm mới.',
        'Đặt câu hỏi gợi ý, yêu cầu SV tự suy luận trước.',
        'Sau khi SV làm được, mới chốt pattern tốt hơn và lý do tại sao.',
        sharedRules,
        ...focusHints,
      ].join(' ');
    }

    return [
      'Đi thẳng vào trọng tâm vấn đề, súc tích, thiên về code review chuyên môn hơn là giảng lại lý thuyết cơ bản.',
      'Ép SV phân tích edge cases, defensive programming và trade-off.',
      'Gắn với ngữ cảnh interview/production, giao SV tự suy nghĩ cách implement trước rồi AI review sau.',
      sharedRules,
      ...focusHints,
    ].join(' ');
  }

  private async buildPromptProfile(userId: number, history: MessageRow[]): Promise<PromptProfile> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { displayName: true, level: true, preferredLanguage: true },
    });

    const analytics = await this.db.query.userAnalytics.findFirst({
      where: eq(userAnalytics.userId, userId),
    });

    const completedProgress = await this.db.query.userProgress.findMany({
      where: and(eq(userProgress.userId, userId), eq(userProgress.completionStatus, 'completed')),
      with: {
        lesson: {
          columns: { id: true, language: true },
        },
      },
    });

    const allLessons = await this.db.query.lessons.findMany({
      columns: { id: true, language: true },
      with: {
        exercises: {
          columns: { id: true },
        },
      },
    });

    const completedExerciseIds = new Set<number>();
    const completedLanguages = new Set<string>();

    for (const row of completedProgress) {
      if (row.exerciseId) completedExerciseIds.add(row.exerciseId);
      if (row.lesson?.language) completedLanguages.add(row.lesson.language);
    }

    let completedLessons = 0;
    for (const lesson of allLessons) {
      if (
        lesson.exercises.length > 0 &&
        lesson.exercises.every((exercise) => completedExerciseIds.has(exercise.id))
      ) {
        completedLessons++;
        completedLanguages.add(lesson.language);
      }
    }

    const name = user?.displayName ?? 'bạn';
    const level: UserLevel = user?.level ?? 'beginner';
    const preferredLanguage = user?.preferredLanguage ?? null;
    const knownTopics = (analytics?.knownTopics as string[] | null) ?? [];
    const errorPatterns = (analytics?.errorPatterns as Record<string, number> | null) ?? {};

    const weakAreas = Object.entries(errorPatterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      name,
      level,
      preferredLanguage,
      languages: Array.from(completedLanguages),
      knownTopics,
      errorPatterns: weakAreas,
      completedLessons,
      totalLessons: allLessons.length,
      completedExercises: completedExerciseIds.size,
      recentSummary: this.buildRecentSummary(history),
      strategy: this.buildStrategy(level, {
        name,
        level,
        preferredLanguage,
        languages: Array.from(completedLanguages),
        knownTopics,
        errorPatterns: weakAreas,
        completedLessons,
        totalLessons: allLessons.length,
        completedExercises: completedExerciseIds.size,
        recentSummary: this.buildRecentSummary(history),
      }),
    };
  }

  private buildExerciseContextPrompt(
    context: ExercisePromptContext,
    exercise: {
      title: string;
      description: string;
      expectedOutput: string;
      testCases: Array<{ input: string; expected: string }>;
      starterCode: string | null;
      lesson: { id: number; language: string } | null;
    },
    profile: PromptProfile,
  ): string {
    const formattedTestCases =
      exercise.testCases
        .map(
          (tc, idx) =>
            `Test Case ${idx + 1}: input = ${tc.input.startsWith('[') ? tc.input.slice(1, -1) : tc.input}, expected out = ${tc.expected}`,
        )
        .join('\n') || 'Không có';

    const preferredLanguage = profile.preferredLanguage ?? 'chưa chọn';
    const currentCode =
      context.currentCode?.trim() || exercise.starterCode?.trim() || 'Chưa có mã nguồn.';

    return `You are a personalized programming tutor AI. Here is the student's profile:
- Name: ${profile.name}
- Current level: ${profile.level}
- Languages learning: ${preferredLanguage}
- Topics already mastered: ${profile.knownTopics.length > 0 ? profile.knownTopics.join(', ') : 'Chưa ghi nhận chủ đề nào'}
- Common mistakes: ${profile.errorPatterns.length > 0 ? profile.errorPatterns.map((item) => `${item.name} (${item.count})`).join(', ') : 'Chưa ghi nhận lỗi nổi bật nào'}
- Lessons completed: ${profile.completedLessons}/${profile.totalLessons}
- Exercises completed: ${profile.completedExercises}
- Recent interaction summary: ${profile.recentSummary}

Teaching strategy for this student (FOLLOW STRICTLY):
${profile.strategy}

Exercise context:
- Exercise title: ${exercise.title}
- Exercise description: ${exercise.description}
- Lesson language: ${exercise.lesson?.language ?? 'unknown'}
- Expected output: ${exercise.expectedOutput}
- Test cases:
${formattedTestCases}
- Current code:
\`\`\`
${currentCode}
\`\`\`
${context.lastError ? `- Last error: ${context.lastError}\n` : ''}

Additional rules:
1. If the student mentions an error type you see in their error patterns, proactively note it.
2. Be encouraging but never hand out the full solution.
3. Always respond in Vietnamese (tiếng Việt).
4. Keep the response aligned with the student's current level and recent interaction summary.`;
  }

  private async buildSystemPrompt(
    userId: number,
    history: MessageRow[],
    context?: ExercisePromptContext,
  ): Promise<string> {
    const profile = await this.buildPromptProfile(userId, history);

    if (context?.exerciseId) {
      const exercise = await this.db.query.exercises.findFirst({
        where: eq(exercises.id, context.exerciseId),
        with: { lesson: { columns: { id: true, language: true } } },
      });

      if (exercise) {
        return this.buildExerciseContextPrompt(
          context,
          {
            title: exercise.title,
            description: exercise.description,
            expectedOutput: exercise.expectedOutput,
            testCases: (exercise.testCases as Array<{ input: string; expected: string }>) ?? [],
            starterCode: exercise.starterCode ?? null,
            lesson: exercise.lesson ?? null,
          },
          profile,
        );
      }
    }

    const languages =
      profile.preferredLanguage ??
      (profile.languages.length > 0 ? profile.languages.join(', ') : 'Chưa có dữ liệu rõ ràng');
    const topics =
      profile.knownTopics.length > 0 ? profile.knownTopics.join(', ') : 'Chưa ghi nhận chủ đề nào';
    const errorPatterns =
      profile.errorPatterns.length > 0
        ? profile.errorPatterns.map((item) => `${item.name} (${item.count})`).join(', ')
        : 'Chưa ghi nhận lỗi nổi bật nào';

    return `You are a personalized programming tutor AI. Here is the student's profile:
- Name: ${profile.name}
- Current level: ${profile.level}
- Languages learning: ${languages}
- Topics already mastered: ${topics}
- Common mistakes: ${errorPatterns}
- Lessons completed: ${profile.completedLessons}/${profile.totalLessons}
- Exercises completed: ${profile.completedExercises}
- Recent interaction summary: ${profile.recentSummary}

Teaching strategy for this student (FOLLOW STRICTLY):
${profile.strategy}

Additional rules:
1. If the student mentions an error type you see in their error patterns, proactively note it.
2. Be encouraging but never hand out the full solution.
3. Always respond in Vietnamese (tiếng Việt).
4. Keep the response aligned with the student's current level and recent interaction summary.`;
  }

  async saveMessages(
    conversationId: string,
    userContent: string,
    assistantContent: string,
    tokensUsed: number,
  ) {
    await this.db.insert(messages).values([
      { conversationId, role: 'user', content: userContent },
      { conversationId, role: 'assistant', content: assistantContent, tokensUsed },
    ]);
    await this.db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));
  }

  async getRecentMessages(conversationId: string, limit = 10) {
    return this.db.query.messages.findMany({
      where: eq(messages.conversationId, conversationId),
      orderBy: [asc(messages.createdAt)],
      limit,
    });
  }

  async updateAnalytics(userId: number, errorKeyword: string | null) {
    const existing = await this.db.query.userAnalytics.findFirst({
      where: eq(userAnalytics.userId, userId),
    });

    if (!existing) {
      await this.db.insert(userAnalytics).values({
        userId,
        errorPatterns: errorKeyword ? { [errorKeyword]: 1 } : {},
      });
    } else if (errorKeyword) {
      const patterns = (existing.errorPatterns as Record<string, number>) ?? {};
      patterns[errorKeyword] = (patterns[errorKeyword] ?? 0) + 1;
      await this.db
        .update(userAnalytics)
        .set({ errorPatterns: patterns })
        .where(eq(userAnalytics.userId, userId));
    }
  }

  async sendMessage(conversationId: string, userId: number, input: SendMessageInput) {
    const conv = await this.getHistory(conversationId, userId);
    if (!conv) throw new Error('Conversation not found');

    const history = await this.getRecentMessages(conversationId, 10);
    const systemPrompt = await this.buildSystemPrompt(userId, history, input.context);

    const historyForAI = history.map((m: MessageRow) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    let titlePromise: Promise<{ inTokens: number; outTokens: number } | undefined> =
      Promise.resolve(undefined);
    if (conv.title === 'New conversation' || conv.title === 'Untitled') {
      titlePromise = this.updateConversationTitleFromFirstMessage(
        conversationId,
        input.content,
      ).catch(() => undefined);
    }

    const response = await this.aiService.chat(systemPrompt, historyForAI, input.content);
    await this.saveMessages(conversationId, input.content, response.content, response.tokensUsed);
    await titlePromise;

    return response;
  }

  async streamMessage(
    conversationId: string,
    userId: number,
    userMessage: string,
    context: ExercisePromptContext | undefined,
    onChunk: (chunk: string) => void,
    onTitleUpdated?: (payload: { conversationId: string; title: string }) => void | Promise<void>,
  ): Promise<string> {
    const conv = await this.getHistory(conversationId, userId);
    if (!conv) throw new Error('Conversation not found');

    const history = await this.getRecentMessages(conversationId, 10);
    const systemPrompt = await this.buildSystemPrompt(userId, history, context);

    const historyForAI = history.map((m: MessageRow) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const titlePromise =
      conv.title === 'New conversation' || conv.title === 'Untitled'
        ? this.updateConversationTitleFromFirstMessage(
            conversationId,
            userMessage,
            onTitleUpdated,
          ).catch(() => undefined)
        : Promise.resolve(undefined);

    let fullContent = '';
    let tokensUsed = 0;

    await this.aiService.chatStream(systemPrompt, historyForAI, userMessage, (chunk: string) => {
      fullContent += chunk;
      tokensUsed++;
      onChunk(chunk);
    });

    await this.saveMessages(conversationId, userMessage, fullContent, tokensUsed);
    await titlePromise;
    return fullContent;
  }
}
