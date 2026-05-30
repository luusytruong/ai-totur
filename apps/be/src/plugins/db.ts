import * as schema from '@workspace/types/db';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import postgres from 'postgres';

declare module 'fastify' {
  interface FastifyInstance {
    db: ReturnType<typeof drizzle<typeof schema>>;
  }
}

export default fp(async function dbPlugin(fastify: FastifyInstance) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL chưa được cấu hình');

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    await client.end();
  });
});
