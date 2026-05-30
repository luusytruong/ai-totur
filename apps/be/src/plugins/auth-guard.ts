import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async function authGuardPlugin(fastify: FastifyInstance) {
  // Note: authenticate is already called via scope-level onRequest hook for protected routes.
  // requireAdmin is used as an *additional* preHandler that only checks the role.
  fastify.decorate('requireAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.user?.role !== 'admin') {
      return reply.code(403).send({ success: false, message: 'Bạn không có quyền truy cập' });
    }
  });
});
