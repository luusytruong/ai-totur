import type { LoginInput, RegisterInput } from '@workspace/types';
import { UserLevel, UserRole, users } from '@workspace/types/db';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import type { DrizzleDB } from '../../types.js';

const SALT_ROUNDS = 12;

export interface DbUser {
  id: number;
  email: string;
  displayName: string | null;
  level: UserLevel;
  role: UserRole;
  preferredLanguage: string | null;
  recommendedLessonId: number | null;
  createdAt: Date;
}

export class AuthService {
  constructor(private readonly db: DrizzleDB) {}

  async register(input: RegisterInput): Promise<DbUser> {
    const existing = await this.db.query.users.findFirst({
      where: eq(users.email, input.email),
    });
    if (existing) throw new Error('Email đã được sử dụng');

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const [user] = await this.db
      .insert(users)
      .values({
        email: input.email,
        passwordHash,
        displayName: input.displayName ?? null,
        level: input.level,
      })
      .returning({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        level: users.level,
        role: users.role,
        preferredLanguage: users.preferredLanguage,
        recommendedLessonId: users.recommendedLessonId,
        createdAt: users.createdAt,
      });

    if (!user) throw new Error('Đăng ký không thành công');
    return user as DbUser;
  }

  async login(input: LoginInput): Promise<DbUser | null> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, input.email),
    });
    if (!user) return null;

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) return null;

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      level: user.level,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      recommendedLessonId: user.recommendedLessonId,
      createdAt: user.createdAt,
    };
  }

  async getProfile(userId: number): Promise<DbUser | null> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      level: user.level,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      recommendedLessonId: user.recommendedLessonId,
      createdAt: user.createdAt,
    };
  }

  async findByEmail(email: string): Promise<DbUser | null> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      level: user.level,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      recommendedLessonId: user.recommendedLessonId,
      createdAt: user.createdAt,
    };
  }

  async updatePassword(userId: number, passwordHash: string): Promise<void> {
    await this.db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  }
}
