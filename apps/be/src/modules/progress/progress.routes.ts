import type { FastifyInstance } from 'fastify';
import { ProgressParamSchema } from './progress.schema.js';
import { ProgressService } from './progress.service.js';

export async function progressRoutes(fastify: FastifyInstance): Promise<void> {
  const progressService = new ProgressService(fastify.db);

  // GET /api/progress/me — progress của user hiện tại
  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request) => {
    const { userId } = request.user;
    const progress = await progressService.getUserProgress(userId);
    return { success: true, data: progress };
  });

  // GET /api/progress/:userId — admin: xem progress của bất kỳ user
  fastify.get('/:userId', { preHandler: [fastify.requireAdmin] }, async (request, reply) => {
    const { userId } = ProgressParamSchema.parse(request.params);
    const data = await progressService.getUserProgress(userId);
    return reply.send({ success: true, data });
  });

  // GET /api/progress/:userId/analytics
  fastify.get(
    '/:userId/analytics',
    { preHandler: [fastify.requireAdmin] },
    async (request, reply) => {
      const { userId } = ProgressParamSchema.parse(request.params);
      const data = await progressService.getAnalytics(userId);
      return reply.send({ success: true, data });
    },
  );
}
