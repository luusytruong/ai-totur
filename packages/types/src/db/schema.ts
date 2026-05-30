import {
  relations,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ====================== ENUMS ======================
export const userRoleEnum = pgEnum("userRole", ["admin", "student"]);
export const userLevelEnum = pgEnum("userLevel", [
  "beginner",
  "intermediate",
  "advanced",
]);
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const submissionStatusEnum = pgEnum("submissionStatus", [
  "pass",
  "fail",
  "error",
]);
export const messageRoleEnum = pgEnum("messageRole", [
  "user",
  "assistant",
  "system",
]);

// ====================== TABLES ======================

export const users = pgTable("users", {
  id: serial().primaryKey(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: text().notNull(),
  displayName: varchar({ length: 100 }),
  level: userLevelEnum().default(userLevelEnum.enumValues[0]).notNull(),
  role: userRoleEnum().default(userRoleEnum.enumValues[1]).notNull(),
  preferredLanguage: varchar({ length: 50 }),
  recommendedLessonId: integer().references(() => lessons.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp().defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: serial().primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  language: varchar({ length: 50 }).notNull(),
  topic: varchar({ length: 100 }).notNull(),
  difficulty: difficultyEnum().notNull(),
  contentMd: text().notNull(),
});

export const exercises = pgTable("exercises", {
  id: serial().primaryKey(),
  lessonId: integer()
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  starterCode: text(),
  expectedOutput: text().notNull(),
  testCases: jsonb()
    .$type<Array<{ input: string; expected: string }>>()
    .notNull(),
  hint: text(),
  prerequisiteLessonId: integer().references(() => lessons.id, {
    onDelete: "set null",
  }),
});

export const exerciseSubmissions = pgTable("exerciseSubmissions", {
  id: serial().primaryKey(),
  userId: integer()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  exerciseId: integer()
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  code: text().notNull(),
  status: submissionStatusEnum().notNull(),
  errorMsg: text(),
  runtimeMs: integer(),
  submittedAt: timestamp().defaultNow().notNull(),
});

export const userProgress = pgTable(
  "userProgress",
  {
    id: serial().primaryKey(),
    userId: integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: integer().references(() => lessons.id, { onDelete: "set null" }),
    exerciseId: integer().references(() => exercises.id, {
      onDelete: "set null",
    }),
    completionStatus: varchar({ length: 20 }).notNull().default("in_progress"),
    score: integer().default(0),
  },
  (t) => [index("idx_userProgress_user").on(t.userId)],
);

export const userAnalytics = pgTable("userAnalytics", {
  id: serial().primaryKey(),
  userId: integer()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  knownTopics: jsonb().$type<string[]>().default([]),
  errorPatterns: jsonb().$type<Record<string, number>>().default({}),
  levelEstimate: userLevelEnum().default(userLevelEnum.enumValues[0]),
});

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 })
      .notNull()
      .default("New conversation"),
    isPublic: boolean("isPublic").default(false).notNull(),
    isDisabled: boolean("isDisabled").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (t) => [index("idx_conversations_user").on(t.userId)],
);

export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    conversationId: uuid("conversationId")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: messageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    tokensUsed: integer("tokensUsed"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => [index("idx_messages_conversation").on(t.conversationId)],
);

// ====================== RELATIONS ======================

export const usersRelations = relations(users, ({ many, one }) => ({
  submissions: many(exerciseSubmissions),
  progress: many(userProgress),
  analytics: one(userAnalytics),
  conversations: many(conversations),
}));

export const lessonsRelations = relations(lessons, ({ many }) => ({
  exercises: many(exercises),
  progress: many(userProgress),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [exercises.lessonId],
    references: [lessons.id],
  }),
  submissions: many(exerciseSubmissions),
  progress: many(userProgress),
}));

export const exerciseSubmissionsRelations = relations(
  exerciseSubmissions,
  ({ one }) => ({
    user: one(users, {
      fields: [exerciseSubmissions.userId],
      references: [users.id],
    }),
    exercise: one(exercises, {
      fields: [exerciseSubmissions.exerciseId],
      references: [exercises.id],
    }),
  }),
);

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, { fields: [userProgress.userId], references: [users.id] }),
  lesson: one(lessons, {
    fields: [userProgress.lessonId],
    references: [lessons.id],
  }),
  exercise: one(exercises, {
    fields: [userProgress.exerciseId],
    references: [exercises.id],
  }),
}));

export const userAnalyticsRelations = relations(userAnalytics, ({ one }) => ({
  user: one(users, { fields: [userAnalytics.userId], references: [users.id] }),
}));

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [conversations.userId],
      references: [users.id],
    }),
    messages: many(messages),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

// ====================== TYPES ======================

export type UserRow = InferSelectModel<typeof users>;
export type NewUserRow = InferInsertModel<typeof users>;
export type LessonRow = InferSelectModel<typeof lessons>;
export type NewLessonRow = InferInsertModel<typeof lessons>;
export type ExerciseRow = InferSelectModel<typeof exercises>;
export type NewExerciseRow = InferInsertModel<typeof exercises>;
export type ExerciseSubmissionRow = InferSelectModel<
  typeof exerciseSubmissions
>;
export type NewExerciseSubmissionRow = InferInsertModel<
  typeof exerciseSubmissions
>;
export type UserProgressRow = InferSelectModel<typeof userProgress>;
export type NewUserProgressRow = InferInsertModel<typeof userProgress>;
export type UserAnalyticsRow = InferSelectModel<typeof userAnalytics>;
export type NewUserAnalyticsRow = InferInsertModel<typeof userAnalytics>;
export type ConversationRow = InferSelectModel<typeof conversations>;
export type NewConversationRow = InferInsertModel<typeof conversations>;
export type MessageRow = InferSelectModel<typeof messages>;
export type NewMessageRow = InferInsertModel<typeof messages>;

export type User = Omit<UserRow, "passwordHash">;
export type UserRole = UserRow["role"];
export type UserLevel = UserRow["level"];
export type ExerciseSubmissionStatus = ExerciseSubmissionRow["status"];
export type Difficulty = LessonRow["difficulty"];
export type MessageRole = MessageRow["role"];
