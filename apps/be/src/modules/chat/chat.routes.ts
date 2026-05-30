import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  ConversationIdParamSchema,
  CreateConversationSchema,
  SearchQuerySchema,
  SendMessageSchema,
  SharedConversationIdParamSchema,
} from './chat.schema.js';
import { ChatService } from './chat.service.js';

export async function chatRoutes(fastify: FastifyInstance): Promise<void> {
  const chatService = new ChatService(fastify.db);

  fastify.post(
    '/',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = request.user;
      const data = CreateConversationSchema.parse(request.body);
      const conv = await chatService.createConversation(userId, data);
      return reply.status(201).send({
        success: true,
        message: 'Tạo cuộc trò chuyện thành công',
        data: conv,
      });
    },
  );

  fastify.get('/', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest) => {
    const { userId } = request.user;
    const conversations = await chatService.getConversations(userId);
    return { success: true, data: conversations };
  });

  fastify.patch(
    '/:id/public',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = ConversationIdParamSchema.parse(request.params);
      const { userId } = request.user;
      const result = await chatService.makeConversationPublic(id, userId);

      if (!result) {
        return reply
          .status(404)
          .send({ success: false, message: 'Không tìm thấy cuộc trò chuyện' });
      }

      return {
        success: true,
        message: 'Đã tạo liên kết chia sẻ công khai',
        data: result,
      };
    },
  );

  fastify.delete(
    '/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = ConversationIdParamSchema.parse(request.params);
      const { userId } = request.user;
      const deleted = await chatService.deleteConversation(id, userId);

      if (!deleted) {
        return reply
          .status(404)
          .send({ success: false, message: 'Không tìm thấy cuộc trò chuyện' });
      }

      return {
        success: true,
        message: 'Đã xoá cuộc trò chuyện',
        data: deleted,
      };
    },
  );

  fastify.get(
    '/search',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest) => {
      const { userId } = request.user;
      const { q } = SearchQuerySchema.parse(request.query);
      const conversations = await chatService.searchConversations(userId, q);
      return { success: true, data: conversations };
    },
  );

  fastify.get(
    '/:id',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = ConversationIdParamSchema.parse(request.params);
      const { userId } = request.user;
      const conv = await chatService.getHistory(id, userId);
      if (!conv) {
        return reply
          .status(404)
          .send({ success: false, message: 'Không tìm thấy cuộc trò chuyện' });
      }
      return { success: true, data: conv };
    },
  );

  fastify.post(
    '/:id/messages',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = ConversationIdParamSchema.parse(request.params);
      const { content, context } = SendMessageSchema.parse(request.body);
      const { userId } = request.user;

      const conv = await chatService.getHistory(id, userId);
      if (!conv) {
        return reply
          .status(404)
          .send({ success: false, message: 'Không tìm thấy cuộc trò chuyện' });
      }

      const origin = request.headers.origin;
      const headers: Record<string, string> = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      };

      if (origin) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Credentials'] = 'true';
      }

      reply.raw.writeHead(200, headers);

      reply.raw.write(': keep-alive\n\n');

      const pingInterval = setInterval(() => {
        if (!reply.raw.destroyed) {
          reply.raw.write(': ping\n\n');
        }
      }, 15000);

      try {
        const fullResponse = await chatService.streamMessage(
          id,
          userId,
          content,
          context,
          (chunk) => {
            reply.raw.write(`event: token\ndata: ${JSON.stringify({ type: 'token', chunk })}\n\n`);
          },
          ({ conversationId, title }) => {
            reply.raw.write(
              `event: titleUpdated\ndata: ${JSON.stringify({ type: 'titleUpdated', conversationId, title })}\n\n`,
            );
          },
        );
        reply.raw.write(
          `event: done\ndata: ${JSON.stringify({ type: 'done', response: fullResponse })}\n\n`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Lỗi stream';
        reply.raw.write(`event: error\ndata: ${JSON.stringify({ type: 'error', message })}\n\n`);
      } finally {
        clearInterval(pingInterval);
        reply.raw.end();
      }
    },
  );
}

export async function chatPublicRoutes(fastify: FastifyInstance): Promise<void> {
  const chatService = new ChatService(fastify.db);

  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = SharedConversationIdParamSchema.parse(request.params);
    const conv = await chatService.getSharedHistory(id);

    if (!conv) {
      return reply.status(404).send({ success: false, message: 'Không tìm thấy cuộc trò chuyện' });
    }

    return { success: true, data: conv };
  });
}
