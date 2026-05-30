import type { FastifyInstance } from 'fastify';
import { ExerciseIdParamSchema, SubmitCodeSchema } from './exercises.schema.js';
import { ExercisesService } from './exercises.service.js';

export async function exercisesRoutes(fastify: FastifyInstance): Promise<void> {
  const exercisesService = new ExercisesService(fastify.db);

  // GET /api/exercises/:id
  fastify.get('/:id', async (request, reply) => {
    const { id } = ExerciseIdParamSchema.parse(request.params);
    const exercise = await exercisesService.getById(id);
    if (!exercise) {
      return reply.status(404).send({ success: false, message: 'Không tìm thấy bài tập' });
    }
    return { success: true, data: exercise };
  });

  // POST /api/exercises/:id/submit
  fastify.post('/:id/submit', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = ExerciseIdParamSchema.parse(request.params);
    const data = SubmitCodeSchema.parse(request.body);
    const { userId } = request.user;

    try {
      const result = await exercisesService.submit(id, userId, data);
      return reply.status(201).send({
        success: true,
        message: 'Nộp bài thành công',
        data: result,
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'Không tìm thấy bài tập') {
        return reply.status(404).send({ success: false, message: err.message });
      }
      throw err;
    }
  });
}
