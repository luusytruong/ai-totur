ALTER TABLE "exercises" ADD COLUMN "hint" text;--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "prerequisiteLessonId" integer;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_prerequisiteLessonId_lessons_id_fk" FOREIGN KEY ("prerequisiteLessonId") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;