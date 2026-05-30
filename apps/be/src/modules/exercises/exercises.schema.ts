import { z } from 'zod';

export const ExerciseIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const SubmitCodeSchema = z.object({
  code: z.string().min(1),
});

export type SubmitCodeInput = z.infer<typeof SubmitCodeSchema>;
