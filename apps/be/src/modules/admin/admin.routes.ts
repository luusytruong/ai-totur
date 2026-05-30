import {
  CreateExerciseSchema,
  CreateLessonSchema,
  CreateUserSchema,
  UpdateExerciseSchema,
  UpdateLessonSchema,
  UpdateUserAdminSchema,
} from '@workspace/types';
import { exercises, lessons, users } from '@workspace/types/db';
import { hash } from 'bcrypt';
import { desc, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';

export async function adminRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', fastify.requireAdmin);

  // ================= USERS =================
  fastify.get('/users', async (_request, _reply) => {
    const usersData = await fastify.db.query.users.findMany({
      orderBy: [desc(users.id)],
      columns: { passwordHash: false },
    });
    return { success: true, data: usersData };
  });

  fastify.get('/users/:id', async (request, reply) => {
    const { id } = request.params as { id: number };
    const user = await fastify.db.query.users.findFirst({
      where: eq(users.id, Number(id)),
      columns: { passwordHash: false },
    });
    if (!user) return reply.status(404).send({ success: false, message: 'User not found' });
    return { success: true, data: user };
  });

  fastify.post('/users', async (request, reply) => {
    const data = CreateUserSchema.parse(request.body);
    const passwordHash = await hash(data.password, 10);
    const [user] = await fastify.db
      .insert(users)
      .values({
        ...data,
        passwordHash,
      })
      .returning();
    const resultUser = { ...user } as Record<string, unknown>;
    delete resultUser.passwordHash;
    return reply.status(201).send({ success: true, data: resultUser });
  });

  fastify.patch('/users/:id', async (request, reply) => {
    const { id } = request.params as { id: number };
    const { password, ...data } = UpdateUserAdminSchema.parse(request.body);
    const updateData: Record<string, unknown> = { ...data };
    if (password && password.length >= 6) {
      updateData.passwordHash = await hash(password, 10);
    }
    const [user] = await fastify.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, Number(id)))
      .returning();
    if (!user) return reply.status(404).send({ success: false, message: 'User not found' });
    const resultUser = { ...user } as Record<string, unknown>;
    delete resultUser.passwordHash;
    return { success: true, data: resultUser };
  });

  fastify.delete('/users/:id', async (request, reply) => {
    const { id } = request.params as { id: number };
    const [user] = await fastify.db
      .delete(users)
      .where(eq(users.id, Number(id)))
      .returning();
    if (!user) return reply.status(404).send({ success: false, message: 'User not found' });
    const resultUser = { ...user } as Record<string, unknown>;
    delete resultUser.passwordHash;
    return { success: true, data: resultUser };
  });

  // ================= LESSONS =================
  fastify.get('/lessons', async (_request, _reply) => {
    const lessonsData = await fastify.db.query.lessons.findMany({
      orderBy: [desc(lessons.id)],
    });
    return { success: true, data: lessonsData };
  });

  fastify.get('/lessons/:id', async (request, reply) => {
    const { id } = request.params as { id: number };
    const lesson = await fastify.db.query.lessons.findFirst({
      where: eq(lessons.id, Number(id)),
    });
    if (!lesson) return reply.status(404).send({ success: false, message: 'Lesson not found' });
    return { success: true, data: lesson };
  });

  fastify.post('/lessons', async (request, reply) => {
    const data = CreateLessonSchema.parse(request.body);
    const [lesson] = await fastify.db.insert(lessons).values(data).returning();
    return reply.status(201).send({ success: true, data: lesson });
  });

  fastify.patch('/lessons/:id', async (request, reply) => {
    const { id } = request.params as { id: number };
    const data = UpdateLessonSchema.parse(request.body);
    const [lesson] = await fastify.db
      .update(lessons)
      .set(data)
      .where(eq(lessons.id, Number(id)))
      .returning();
    if (!lesson) return reply.status(404).send({ success: false, message: 'Lesson not found' });
    return { success: true, data: lesson };
  });

  fastify.delete('/lessons/:id', async (request, reply) => {
    const { id } = request.params as { id: number };
    const [lesson] = await fastify.db
      .delete(lessons)
      .where(eq(lessons.id, Number(id)))
      .returning();
    if (!lesson) return reply.status(404).send({ success: false, message: 'Lesson not found' });
    return { success: true, data: lesson };
  });

  // ================= EXERCISES =================
  fastify.get('/exercises', async (request, _reply) => {
    const { lessonId } = request.query as { lessonId?: string };
    const exercisesData = await fastify.db.query.exercises.findMany({
      where: lessonId ? eq(exercises.lessonId, Number(lessonId)) : undefined,
      orderBy: [desc(exercises.id)],
      with: { lesson: { columns: { title: true } } },
    });
    return { success: true, data: exercisesData };
  });

  fastify.get('/exercises/:id', async (request, reply) => {
    const { id } = request.params as { id: number };
    const exercise = await fastify.db.query.exercises.findFirst({
      where: eq(exercises.id, Number(id)),
      with: { lesson: { columns: { title: true } } },
    });
    if (!exercise) return reply.status(404).send({ success: false, message: 'Exercise not found' });
    return { success: true, data: exercise };
  });

  fastify.post('/exercises', async (request, reply) => {
    const data = CreateExerciseSchema.parse(request.body);
    const [exercise] = await fastify.db.insert(exercises).values(data).returning();
    return reply.status(201).send({ success: true, data: exercise });
  });

  fastify.patch('/exercises/:id', async (request, reply) => {
    const { id } = request.params as { id: number };
    const data = UpdateExerciseSchema.parse(request.body);
    const [exercise] = await fastify.db
      .update(exercises)
      .set(data)
      .where(eq(exercises.id, Number(id)))
      .returning();
    if (!exercise) return reply.status(404).send({ success: false, message: 'Exercise not found' });
    return { success: true, data: exercise };
  });

  fastify.delete('/exercises/:id', async (request, reply) => {
    const { id } = request.params as { id: number };
    const [exercise] = await fastify.db
      .delete(exercises)
      .where(eq(exercises.id, Number(id)))
      .returning();
    if (!exercise) return reply.status(404).send({ success: false, message: 'Exercise not found' });
    return { success: true, data: exercise };
  });

  // ================= REPORTS =================
  fastify.get('/reports', async (_request, _reply) => {
    const allUsers = await fastify.db.query.users.findMany();
    const allSubmissions = await fastify.db.query.exerciseSubmissions.findMany();
    const allLessons = await fastify.db.query.lessons.findMany();
    const allExercises = await fastify.db.query.exercises.findMany();
    const allMessages = await fastify.db.query.messages.findMany();

    const usersCount = allUsers.length;
    const submissionsCount = allSubmissions.length;
    const activeLessons = allLessons.length;
    const exercisesCount = allExercises.length;

    // Submissions -> Daily metrics
    const dailySubmissionsMap: Record<string, { success: number; failed: number }> = {};
    for (const sub of allSubmissions) {
      if (!sub.submittedAt) continue;
      const date = sub.submittedAt.toISOString().split('T')[0] as string;
      if (!dailySubmissionsMap[date]) dailySubmissionsMap[date] = { success: 0, failed: 0 };
      if (sub.status === 'pass') dailySubmissionsMap[date].success++;
      else dailySubmissionsMap[date].failed++;
    }
    const dailySubmissions = Object.keys(dailySubmissionsMap)
      .sort()
      .map((d) => ({
        date: d,
        ...dailySubmissionsMap[d as string]!,
      }));

    // Messages -> Daily metrics
    const dailyMessagesMap: Record<string, { user: number; assistant: number }> = {};
    for (const msg of allMessages) {
      if (msg.role === 'system' || !msg.createdAt) continue;
      const date = msg.createdAt.toISOString().split('T')[0] as string;
      if (!dailyMessagesMap[date]) dailyMessagesMap[date] = { user: 0, assistant: 0 };
      if (msg.role === 'user') dailyMessagesMap[date].user++;
      else if (msg.role === 'assistant') dailyMessagesMap[date].assistant++;
    }
    const dailyMessages = Object.keys(dailyMessagesMap)
      .sort()
      .map((d) => ({
        date: d,
        ...dailyMessagesMap[d as string]!,
      }));

    // Leaderboard logic
    const todayStr = new Date().toISOString().split('T')[0] as string;
    const topUsersList = allUsers.map((u) => {
      const uSubs = allSubmissions.filter((s) => s.userId === u.id);
      const passedDays = Array.from(
        new Set(
          uSubs
            .filter((s) => s.status === 'pass')
            .map((s) => s.submittedAt.toISOString().split('T')[0] as string),
        ),
      )
        .sort()
        .reverse();

      let streakCount = 0;
      const checkDate = new Date();
      while (true) {
        const dStr = checkDate.toISOString().split('T')[0] as string;
        if (passedDays.includes(dStr)) {
          streakCount++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          if (streakCount === 0 && dStr === todayStr) {
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      const exercisesCompleted = new Set(
        uSubs.filter((s) => s.status === 'pass').map((x) => x.exerciseId || 0),
      ).size;

      let initials = 'U';
      if (u.displayName && u.displayName.trim().length > 0) {
        const parts = u.displayName
          .trim()
          .split(' ')
          .filter((p) => p.length > 0);
        if (parts.length > 1) {
          initials = String(parts[0]?.[0] || '') + String(parts[parts.length - 1]?.[0] || '');
        } else if (parts.length === 1) {
          initials = parts[0]!.substring(0, 2);
        }
      } else if (u.email) {
        initials = u.email.substring(0, 2).toUpperCase();
      }

      return {
        id: u.id,
        name: u.displayName || u.email,
        avatarInitials: initials.toUpperCase(),
        lessonsCompleted: exercisesCompleted,
        exercisesCompleted,
        streakCount,
      };
    });

    return {
      success: true,
      data: {
        status: 'thành công',
        usersCount,
        submissionsCount,
        activeLessons,
        exercisesCount,
        dailySubmissions,
        dailyMessages,
        topUsersList,
      },
    };
  });
}
