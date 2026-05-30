import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  type LoginResponse,
  type RefreshTokenResponse,
  type RegisterResponse,
} from '@workspace/types';
import { User } from '@workspace/types/db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { FastifyInstance } from 'fastify';
import { EmailService } from '../../services/email.service.js';
import { AuthService } from './auth.service.js';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const authService = new AuthService(fastify.db);

  // POST /api/auth/register
  fastify.post('/register', async (request, reply) => {
    const data = RegisterSchema.parse(request.body);
    try {
      const user = await authService.register(data);

      const responseUser: User = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        level: user.level,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        recommendedLessonId: user.recommendedLessonId,
        createdAt: user.createdAt,
      };

      const payload = { userId: user.id, email: user.email, role: user.role };
      const accessToken = fastify.jwt.sign(payload, { expiresIn: '24h' });
      const refreshToken = fastify.jwt.sign(payload, { expiresIn: '7d' });

      return reply.status(201).send({
        success: true,
        message: 'Đăng ký thành công',
        data: { user: responseUser, accessToken, refreshToken },
      } satisfies RegisterResponse);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đăng ký thất bại';
      if (message === 'Email đã được sử dụng') {
        return reply.status(409).send({ success: false, message });
      }
      throw err;
    }
  });

  // POST /api/auth/login
  fastify.post('/login', async (request, reply) => {
    const data = LoginSchema.parse(request.body);
    const user = await authService.login(data);
    if (!user) {
      return reply.status(401).send({ success: false, message: 'Sai email hoặc mật khẩu' });
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = fastify.jwt.sign(payload, { expiresIn: '24h' });
    const refreshToken = fastify.jwt.sign(payload, { expiresIn: '7d' });

    const responseUser: User = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      level: user.level,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      recommendedLessonId: user.recommendedLessonId,
      createdAt: user.createdAt,
    };

    return reply.send({
      success: true,
      message: 'Đăng nhập thành công',
      data: { user: responseUser, accessToken, refreshToken },
    } satisfies LoginResponse);
  });

  // POST /api/auth/refresh
  fastify.post('/refresh', async (request, reply) => {
    try {
      let token = request.cookies.refresh_token;
      if (!token && request.headers.authorization) {
        token = request.headers.authorization.replace('Bearer ', '');
      }
      if (!token) throw new Error('Missing refresh token');

      const decoded = fastify.jwt.verify<{ userId: number; email: string; role: string }>(token);
      const payload = { userId: decoded.userId, email: decoded.email, role: decoded.role };
      const accessToken = fastify.jwt.sign(payload, { expiresIn: '24h' });

      reply.setCookie('access_token', accessToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return reply.send({
        success: true,
        message: 'Làm mới phiên đăng nhập thành công',
        data: { accessToken },
      } satisfies RefreshTokenResponse);
    } catch {
      return reply.status(401).send({ success: false, message: 'Mã xác thực không hợp lệ' });
    }
  });

  // POST /api/auth/forgot-password
  fastify.post('/forgot-password', async (request, reply) => {
    const { email } = ForgotPasswordSchema.parse(request.body);
    const user = await authService.findByEmail(email);

    if (!user) {
      return reply.send({
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, bạn sẽ sớm nhận được liên kết đặt lại mật khẩu',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await fastify.redis.set(`reset_password:${resetToken}`, user.id.toString(), 'EX', 3600);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const emailService = new EmailService();

    try {
      await emailService.sendResetPasswordEmail(user.email, resetLink);
    } catch (error) {
      console.error('Gửi email thất bại:', error);
      return reply.status(500).send({
        success: false,
        message: 'Gửi email thất bại',
      });
    }

    return reply.send({
      success: true,
      message: 'Liên kết đặt lại mật khẩu đã được gửi qua email của bạn',
    });
  });

  // POST /api/auth/reset-password
  fastify.post('/reset-password', async (request, reply) => {
    const { token, password } = ResetPasswordSchema.parse(request.body);

    const userIdStr = await fastify.redis.get(`reset_password:${token}`);
    if (!userIdStr) {
      return reply.status(400).send({
        success: false,
        message: 'Mã xác thực không hợp lệ hoặc đã hết hạn',
      });
    }

    const userId = parseInt(userIdStr, 10);
    const passwordHash = await bcrypt.hash(password, 12);
    await authService.updatePassword(userId, passwordHash);

    await fastify.redis.del(`reset_password:${token}`);

    return reply.send({
      success: true,
      message: 'Đổi mật khẩu thành công, hãy đăng nhập bằng mật khẩu mới',
    });
  });
}
