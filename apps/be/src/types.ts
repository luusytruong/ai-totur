import type * as schema from '@workspace/types/db';
import type { drizzle } from 'drizzle-orm/postgres-js';
import type postgres from 'postgres';

export type DrizzleDB = ReturnType<typeof drizzle<typeof schema, ReturnType<typeof postgres>>>;
