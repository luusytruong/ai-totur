import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  role: z.enum(["admin", "student"]).default("student"),
});

export const UpdateUserAdminSchema = z.object({
  displayName: z.string().min(2).optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  role: z.enum(["admin", "student"]).optional(),
  preferredLanguage: z.string().optional().nullable(),
  password: z.string().min(6).optional().or(z.literal("")),
});

export const CreateLessonSchema = z.object({
  title: z.string().min(1),
  language: z.string().min(1),
  topic: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  contentMd: z.string().min(1),
});

export const UpdateLessonSchema = CreateLessonSchema.partial();

export const TestCaseSchema = z.object({
  input: z.string(),
  expected: z.string(),
});

export const CreateExerciseSchema = z.object({
  lessonId: z.coerce.number().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  starterCode: z.string().optional(),
  expectedOutput: z.string().min(1),
  testCases: z.array(TestCaseSchema).min(1),
  hint: z.string().optional(),
  prerequisiteLessonId: z.coerce.number().positive().optional().nullable(),
});

export const UpdateExerciseSchema = CreateExerciseSchema.partial();

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserAdminSchema>;

export type CreateLessonInput = z.infer<typeof CreateLessonSchema>;
export type UpdateLessonInput = z.infer<typeof UpdateLessonSchema>;

export type CreateExerciseInput = z.infer<typeof CreateExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof UpdateExerciseSchema>;
export type TestCaseInput = z.infer<typeof TestCaseSchema>;
