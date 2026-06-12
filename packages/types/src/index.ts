import { z } from "zod";
import {
  ConversationRow,
  ExerciseRow,
  LessonRow,
  MessageRow,
  User,
  UserAnalyticsRow,
  UserProgressRow,
} from "./db";
export * from "./admin";
export * from "./db";
// ====================== SCHEMAS ======================

export const LoginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu ít nhất 6 ký tự" }),
});

export const RegisterSchema = z
  .object({
    email: z.string().email({ message: "Email không hợp lệ" }),
    password: z.string().min(6, { message: "Mật khẩu ít nhất 6 ký tự" }),
    displayName: z.string().min(2, { message: "Tên hiển thị ít nhất 2 ký tự" }),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    confirmPassword: z
      .string()
      .min(6, { message: "Vui lòng xác nhận mật khẩu" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export const UpdateUserSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "Tên hiển thị ít nhất 2 ký tự" })
    .optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  preferredLanguage: z.string().optional(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: "Token không hợp lệ" }),
    password: z.string().min(6, { message: "Mật khẩu ít nhất 6 ký tự" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Vui lòng xác nhận mật khẩu" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export const ChangeInfoSchema = z
  .object({
    displayName: z
      .string()
      .min(2, { message: "Tên hiển thị ít nhất 2 ký tự" })
      .optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    preferredLanguage: z.string().optional(),
    oldPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // Nếu có bất kỳ trường mật khẩu nào được nhập, thì phải nhập đủ cả 3
      const hasPasswordInput =
        !!data.newPassword || !!data.oldPassword || !!data.confirmPassword;
      if (hasPasswordInput) {
        return (
          !!data.newPassword &&
          data.newPassword.length >= 6 &&
          !!data.oldPassword &&
          data.oldPassword.length >= 6 &&
          !!data.confirmPassword &&
          data.newPassword === data.confirmPassword
        );
      }
      return true;
    },
    {
      message: "Mật khẩu không khớp hoặc độ dài không đủ (tối thiểu 6 ký tự)",
      path: ["confirmPassword"],
    },
  );

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type ChangeInfoInput = z.infer<typeof ChangeInfoSchema>;

// ====================== API RESPONSE ======================

/**
 * Chuẩn API response duy nhất cho toàn bộ app.
 *
 * - Thành công: { success: true, message?: "...", data: T }
 * - Thất bại:   { success: false, message?: "..." }
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// ====================== SHARED MODEL TYPES ======================

export type ExerciseTestCase = {
  input: string;
  expected: string;
};

export type LessonRecommendation = {
  id: number;
  title: string;
  language: string;
  topic: string;
  difficulty: string;
  contentMd?: string;
  reason?: string;
};

export type ExerciseWithLesson = ExerciseRow & {
  lesson: Pick<LessonRow, "id" | "language"> | null;
};

export type ExerciseSubmitResult = {
  action: "none" | "hint" | "reroute";
  hint: string | null;
  suggestedLessonId: number | null;
  nextLessonSuggestion: LessonRecommendation | null;
  shouldFetchNextLessonSuggestion: boolean;
  submission: {
    id: number;
    status: "pass" | "fail" | "error";
    errorMsg: string | null;
    runtimeMs: number | null;
  };
  result: {
    status: "pass" | "fail" | "error";
    runtimeMs: number;
    errorMsg: string | null;
    failedCaseIndex: number | null;
    stdout?: string;
  };
};

export type LessonWithExercises = LessonRow & {
  exercises: Array<ExerciseRow & { isCompleted?: boolean }>;
};

export type LessonListItem = LessonRow & {
  isRecommended: boolean;
  stats: {
    totalExercises: number;
    completedExercises: number;
    isCompleted: boolean;
    isStarted: boolean;
    progress: number;
  };
};

export type LessonStats = {
  totalLessons: number;
  completedLessons: number;
  totalExercises: number;
  completedExercises: number;
};

// ====================== TYPED API RESPONSES ======================

export type LoginResponse = ApiResponse<{
  user: User;
  accessToken: string;
  refreshToken: string;
}>;
export type RegisterResponse = ApiResponse<{
  user: User;
  accessToken: string;
  refreshToken: string;
}>;
export type ProfileResponse = ApiResponse<User>;
export type RefreshTokenResponse = ApiResponse<{ accessToken: string }>;
export type ConversationsResponse = ApiResponse<ConversationRow[]>;
export type ConversationResponse = ApiResponse<
  ConversationRow & {
    messages: MessageRow[];
  }
>;
export type ConversationShareResponse = ApiResponse<{
  conversation: ConversationRow;
  publicUrl: string;
}>;
export type ExerciseDetailResponse = ApiResponse<ExerciseWithLesson>;
export type ExerciseSubmitResponse = ApiResponse<ExerciseSubmitResult>;
export type LessonsResponse = ApiResponse<{
  items: LessonListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}>;
export type LessonDetailResponse = ApiResponse<LessonWithExercises>;
export type LessonRecommendationResponse =
  ApiResponse<LessonRecommendation | null>;
export type LessonStatsResponse = ApiResponse<LessonStats>;
export type UserProgressListItem = UserProgressRow & {
  lesson: Pick<LessonRow, "id" | "title" | "topic"> | null;
  exercise: Pick<ExerciseRow, "id" | "title"> | null;
};
export type UserProgressResponse = ApiResponse<UserProgressListItem[]>;
export type UserAnalyticsData = {
  analytics: (UserAnalyticsRow & { user: User }) | null;
  submissionStats: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    avgRuntimeMs: number | null;
  };
  activity: Array<{ date: string; count: number }>;
  xpHistory: Array<{ date: string; xp: number }>;
};
export type UserAnalyticsResponse = ApiResponse<UserAnalyticsData>;
