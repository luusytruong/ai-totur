import { z } from 'zod';

export const CreateLessonSchema = z.object({
  title: z.string().min(1),
  language: z.string().min(1),
  topic: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  contentMd: z.string().min(1),
});

export const ListLessonsQuerySchema = z.object({
  language: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.enum(['all', 'easy', 'medium', 'hard']).optional(),
  search: z.string().optional(),
  offset: z.coerce.number().int().min(0).optional(),
  limit: z.coerce.number().int().positive().default(12),
  page: z.coerce.number().int().min(1).default(1),
});

export const LessonIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateLessonInput = z.infer<typeof CreateLessonSchema>;
export type ListLessonsQuery = z.infer<typeof ListLessonsQuerySchema>;
