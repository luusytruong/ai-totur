import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Redis } from 'ioredis';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

export default fp(async function redisPlugin(fastify: FastifyInstance) {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) throw new Error('REDIS_URL chưa được cấu hình');

  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  redis.on('error', (err) => {
    fastify.log.error(`Redis Error: ${err.message}`);
  });

  try {
    await redis.connect();
    fastify.log.info('Redis kết nối thành công');
  } catch (err) {
    fastify.log.error(
      `Kết nối Redis thất bại: ${err instanceof Error ? err.message : String(err)}`,
    );
    // Depending on requirement, we could throw here or just let the app run without redis
    // throw err;
  }

  fastify.decorate('redis', redis);

  fastify.addHook('onClose', async () => {
    await redis.quit();
  });
});
