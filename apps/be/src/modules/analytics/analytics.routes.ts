import type { FastifyInstance } from 'fastify';
import { ProgressService } from '../progress/progress.service.js';

export async function analyticsRoutes(fastify: FastifyInstance): Promise<void> {
  // Re-use logic from ProgressService
  const progressService = new ProgressService(fastify.db);

  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request) => {
    const { userId } = request.user;
    const analytics = await progressService.getAnalytics(userId);
    return { success: true, data: analytics };
  });
}
