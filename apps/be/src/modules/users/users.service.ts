import { ChangeInfoInput } from '@workspace/types';
import { users, type NewUserRow } from '@workspace/types/db';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import type { DrizzleDB } from '../../types.js';

export class UsersService {
  constructor(private readonly db: DrizzleDB) {}

  async getProfile(userId: number) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        email: true,
        displayName: true,
        level: true,
        role: true,
        preferredLanguage: true,
        createdAt: true,
      },
    });
    return user;
  }

  async updateProfile(userId: number, data: ChangeInfoInput) {
    const updateData: Partial<NewUserRow> = {};

    if (data.displayName !== undefined) {
      updateData.displayName = data.displayName;
    }

    if (data.level !== undefined) {
      updateData.level = data.level;
    }

    if (data.preferredLanguage !== undefined) {
      updateData.preferredLanguage = data.preferredLanguage;
      updateData.recommendedLessonId = null; // Reset recommendation when language changes
    }

    if (data.newPassword && data.oldPassword) {
      const user = await this.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) throw new Error('Người dùng không tồn tại');

      const isValid = await bcrypt.compare(data.oldPassword, user.passwordHash);
      if (!isValid) throw new Error('Mật khẩu cũ không chính xác');

      updateData.passwordHash = await bcrypt.hash(data.newPassword, 12);
    }

    const [updated] = await this.db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        level: users.level,
        role: users.role,
        preferredLanguage: users.preferredLanguage,
        createdAt: users.createdAt,
      });

    return updated;
  }
}
