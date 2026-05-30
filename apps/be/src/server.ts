import cors from '@fastify/cors';
import 'dotenv/config';
import Fastify from 'fastify';
import { z } from 'zod';

// Plugins
import authGuardPlugin from './plugins/auth-guard.js';
import authPlugin from './plugins/auth.js';
import dbPlugin from './plugins/db.js';
import redisPlugin from './plugins/redis.js';

// Module routes
import { adminRoutes } from './modules/admin/admin.routes.js';
import { analyticsRoutes } from './modules/analytics/analytics.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { chatPublicRoutes, chatRoutes } from './modules/chat/chat.routes.js';
import { exercisesRoutes } from './modules/exercises/exercises.routes.js';
import { lessonsRoutes } from './modules/lessons/lessons.routes.js';
import { progressRoutes } from './modules/progress/progress.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';

const PORT = Number(process.env.PORT ?? 3000);

const isDev = process.env.NODE_ENV !== 'production';

const fastify = Fastify({
  logger: isDev
    ? {
        level: process.env.LOG_LEVEL ?? 'info',
        transport: { target: 'pino-pretty', options: { colorize: true } },
      }
    : { level: process.env.LOG_LEVEL ?? 'info' },
});

import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

async function start() {
  // ====================== PLUGINS ======================
  await fastify.register(helmet, {
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
  });
  await fastify.register(rateLimit, {
    max: isDev ? 10000 : 100, // max 10000 requests per IP trong lúc dev/test để k6 không bị giới hạn
    timeWindow: '1 minute',
  });
  await fastify.register(dbPlugin);
  await fastify.register(redisPlugin);
  await fastify.register(import('@fastify/cookie'));
  await fastify.register(authPlugin);
  await fastify.register(authGuardPlugin);
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ====================== ERROR HANDLER ======================
  fastify.setErrorHandler((error, _request, reply) => {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return reply.status(400).send({
        success: false,
        message: message,
      });
    }

    fastify.log.error(error);
    const statusCode =
      error &&
      typeof error === 'object' &&
      'statusCode' in error &&
      typeof error.statusCode === 'number'
        ? error.statusCode
        : 500;
    const message = error instanceof Error ? error.message : 'Lỗi máy chủ nội bộ';
    return reply.status(statusCode).send({ success: false, message });
  });

  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      message: `Không tìm thấy tài nguyên: ${request.method} ${request.url}`,
    });
  });

  // ====================== HEALTH ======================
  fastify.get('/health', async () => ({
    success: true,
    data: {
      status: 'hoạt động',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  }));

  // ====================== ROUTES ======================
  // Public routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });

  // Protected routes – requires valid JWT cookie
  await fastify.register(
    async (protectedScope) => {
      protectedScope.addHook('onRequest', async (request, reply) => {
        await fastify.authenticate(request, reply);
      });

      await protectedScope.register(usersRoutes, { prefix: '/users' });
      await protectedScope.register(lessonsRoutes, { prefix: '/lessons' });
      await protectedScope.register(exercisesRoutes, { prefix: '/exercises' });
      await protectedScope.register(chatRoutes, { prefix: '/conversations' });
      await protectedScope.register(progressRoutes, { prefix: '/progress' });
      await protectedScope.register(analyticsRoutes, { prefix: '/analytics' });
      await protectedScope.register(adminRoutes, { prefix: '/admin' });
    },
    { prefix: '/api' },
  );

  await fastify.register(chatPublicRoutes, { prefix: '/api/shared/conversations' });

  // ====================== START ======================
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
