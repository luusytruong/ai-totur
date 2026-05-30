import { ChangeInfoSchema, type ProfileResponse } from '@workspace/types';
import type { FastifyInstance } from 'fastify';
import { UsersService } from './users.service.js';

export async function usersRoutes(fastify: FastifyInstance): Promise<void> {
  const usersService = new UsersService(fastify.db);

  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { userId } = request.user;
    const profile = await usersService.getProfile(userId);
    if (!profile) {
      return reply.status(404).send({ success: false, message: 'Không tìm thấy người dùng' });
    }

    return reply.send({
      success: true,
      message: 'Lấy thông tin người dùng thành công',
      data: profile,
    } as ProfileResponse);
  });

  fastify.patch('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { userId } = request.user;
    const data = ChangeInfoSchema.parse(request.body);

    const updateOptions: Record<string, any> = {
      displayName: data.displayName,
      level: data.level,
      preferredLanguage: data.preferredLanguage,
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    };

    // Remove undefined fields
    Object.keys(updateOptions).forEach((key) => {
      if (updateOptions[key] === undefined) {
        delete updateOptions[key];
      }
    });

    if (Object.keys(updateOptions).length === 0) {
      return reply.status(400).send({
        success: false,
        message: 'No data to update',
      });
    }

    const updated = await usersService.updateProfile(userId, updateOptions);

    return reply.send({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: updated,
    } as ProfileResponse);
  });
}
