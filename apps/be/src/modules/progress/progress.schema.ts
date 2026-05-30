import { z } from 'zod';

export const ProgressParamSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export type ProgressParam = z.infer<typeof ProgressParamSchema>;
