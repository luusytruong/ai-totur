import jwt from '@fastify/jwt';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: number; email: string };
    user: {
      userId: number;
      email: string;
      role: string;
    };
  }
}

export default fp(async function authPlugin(fastify: FastifyInstance) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET chưa được cấu hình');

  await fastify.register(jwt, {
    secret,
    cookie: {
      cookieName: 'access_token',
      signed: false,
    },
  });

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ success: false, message: 'Không thể xác thực yêu cầu' });
    }
  });
});
