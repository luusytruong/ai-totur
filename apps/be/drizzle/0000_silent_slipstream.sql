CREATE TYPE "public"."difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."messageRole" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
CREATE TYPE "public"."submissionStatus" AS ENUM('pass', 'fail', 'error');--> statement-breakpoint
CREATE TYPE "public"."userLevel" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."userRole" AS ENUM('admin', 'student');--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" integer NOT NULL,
	"title" varchar(255) DEFAULT 'New conversation' NOT NULL,
	"isDisabled" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exerciseSubmissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"exerciseId" integer NOT NULL,
	"code" text NOT NULL,
	"status" "submissionStatus" NOT NULL,
	"errorMsg" text,
	"runtimeMs" integer,
	"submittedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"lessonId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"starterCode" text,
	"expectedOutput" text NOT NULL,
	"testCases" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"language" varchar(50) NOT NULL,
	"topic" varchar(100) NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"contentMd" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversationId" uuid NOT NULL,
	"role" "messageRole" NOT NULL,
	"content" text NOT NULL,
	"tokensUsed" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userAnalytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"knownTopics" jsonb DEFAULT '[]'::jsonb,
	"errorPatterns" jsonb DEFAULT '{}'::jsonb,
	"levelEstimate" "userLevel" DEFAULT 'beginner',
	CONSTRAINT "userAnalytics_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "userProgress" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"lessonId" integer,
	"exerciseId" integer,
	"completionStatus" varchar(20) DEFAULT 'in_progress' NOT NULL,
	"score" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"passwordHash" text NOT NULL,
	"displayName" varchar(100),
	"level" "userLevel" DEFAULT 'beginner' NOT NULL,
	"role" "userRole" DEFAULT 'student' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exerciseSubmissions" ADD CONSTRAINT "exerciseSubmissions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exerciseSubmissions" ADD CONSTRAINT "exerciseSubmissions_exerciseId_exercises_id_fk" FOREIGN KEY ("exerciseId") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_lessonId_lessons_id_fk" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_conversations_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userAnalytics" ADD CONSTRAINT "userAnalytics_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userProgress" ADD CONSTRAINT "userProgress_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userProgress" ADD CONSTRAINT "userProgress_lessonId_lessons_id_fk" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userProgress" ADD CONSTRAINT "userProgress_exerciseId_exercises_id_fk" FOREIGN KEY ("exerciseId") REFERENCES "public"."exercises"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_conversations_user" ON "conversations" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_messages_conversation" ON "messages" USING btree ("conversationId");--> statement-breakpoint
CREATE INDEX "idx_userProgress_user" ON "userProgress" USING btree ("userId");