import { z } from 'zod';

export const CreateConversationSchema = z.object({
  title: z.string().min(1).max(255).optional(),
});

export const SendMessageSchema = z.object({
  content: z.string().min(1),
  context: z
    .object({
      exerciseId: z.number().int().positive().optional(),
      currentCode: z.string().min(1).optional(),
      lastError: z.string().min(1).optional().nullable(),
    })
    .optional(),
});

export const ConversationIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const SharedConversationIdParamSchema = ConversationIdParamSchema;

export const SearchQuerySchema = z.object({
  q: z.string().min(1),
});

export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
