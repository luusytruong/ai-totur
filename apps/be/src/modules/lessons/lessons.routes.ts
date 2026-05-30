import type { FastifyInstance } from 'fastify';
import {
  CreateLessonSchema,
  LessonIdParamSchema,
  ListLessonsQuerySchema,
} from './lessons.schema.js';
import { LessonsService } from './lessons.service.js';

export async function lessonsRoutes(fastify: FastifyInstance): Promise<void> {
  const lessonsService = new LessonsService(fastify.db, fastify.redis);

  // GET /api/lessons/stats
  fastify.get('/stats', async (request) => {
    await request.jwtVerify();
    const userId = (request.user as { userId: number }).userId;
    const stats = await lessonsService.getStats(userId);
    return { success: true, data: stats };
  });

  // GET /api/lessons/topics
  fastify.get('/topics', async () => {
    const topics = await lessonsService.getUniqueTopics();
    return { success: true, data: topics };
  });

  // GET /api/lessons?language=&topic=&difficulty=
  fastify.get('/', async (request) => {
    // Try to get userId if authenticated, but don't fail if not
    let userId: number | undefined;
    try {
      await request.jwtVerify();
      userId = (request.user as { userId: number }).userId;
    } catch {
      // Not authenticated, userId remains undefined
    }

    const query = ListLessonsQuerySchema.parse(request.query);
    const lessons = await lessonsService.list(query, userId);
    return { success: true, data: lessons };
  });

  // GET /api/lessons/:id
  fastify.get('/:id', async (request, reply) => {
    let userId: number | undefined;
    try {
      await request.jwtVerify();
      userId = (request.user as { userId: number }).userId;
    } catch {
      // Not authenticated
    }

    const { id } = LessonIdParamSchema.parse(request.params);
    const lesson = await lessonsService.getById(id, userId);
    if (!lesson) {
      return reply.status(404).send({ success: false, message: 'Không tìm thấy bài học' });
    }
    return { success: true, data: lesson };
  });

  // GET /api/lessons/:id/next
  fastify.get('/:id/next', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = LessonIdParamSchema.parse(request.params);
    const { userId } = request.user as { userId: number };

    const recommendation = await lessonsService.recommendNextLesson(userId, id);
    return reply.send({
      success: true,
      data: recommendation,
    });
  });

  // GET /api/lessons/recommend
  fastify.get('/recommend', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: number };
    const recommendation = await lessonsService.recommendNextLesson(userId);
    return reply.send({
      success: true,
      data: recommendation,
    });
  });

  // POST /api/lessons (admin)
  fastify.post('/', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const data = CreateLessonSchema.parse(request.body);
    const lesson = await lessonsService.create(data);
    return reply.status(201).send({
      success: true,
      message: 'Tạo bài học thành công',
      data: lesson,
    });
  });
}
