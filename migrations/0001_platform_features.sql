CREATE TABLE IF NOT EXISTS "course_requests" (
  "id" varchar(36) PRIMARY KEY NOT NULL,
  "requester_user_id" varchar(36),
  "student_id" varchar(36),
  "child_id" varchar(36),
  "parent_id" varchar(36),
  "teacher_id" varchar(36),
  "subject" text NOT NULL,
  "level" text,
  "course_type" text,
  "requested_date" text,
  "requested_time" text,
  "message" text,
  "status" text DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

ALTER TABLE "course_requests" ADD COLUMN IF NOT EXISTS "requester_user_id" varchar(36);
ALTER TABLE "course_requests" ADD COLUMN IF NOT EXISTS "student_id" varchar(36);
ALTER TABLE "course_requests" ADD COLUMN IF NOT EXISTS "child_id" varchar(36);
ALTER TABLE "course_requests" ADD COLUMN IF NOT EXISTS "parent_id" varchar(36);
ALTER TABLE "course_requests" ADD COLUMN IF NOT EXISTS "teacher_id" varchar(36);
ALTER TABLE "course_requests" ADD COLUMN IF NOT EXISTS "subject" text;
ALTER TABLE "course_requests" ADD COLUMN IF NOT EXISTS "level" text;
ALTER TABLE "course_requests" ADD COLUMN IF NOT EXISTS "course_type" text;
ALTER TABLE "course_requests" ADD COLUMN IF NOT EXISTS "requested_date" text;
ALTER TABLE "course_requests" ADD COLUMN IF NOT EXISTS "requested_time" text;
ALTER TABLE "course_requests" ADD COLUMN IF NOT EXISTS "message" text;
ALTER TABLE "course_requests" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'pending';
ALTER TABLE "course_requests" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now();
ALTER TABLE "course_requests" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
UPDATE "course_requests" SET "subject" = 'Cours' WHERE "subject" IS NULL;
UPDATE "course_requests" SET "status" = 'pending' WHERE "status" IS NULL;
ALTER TABLE "course_requests" ALTER COLUMN "subject" SET NOT NULL;
ALTER TABLE "course_requests" ALTER COLUMN "status" SET DEFAULT 'pending';
ALTER TABLE "course_requests" ALTER COLUMN "status" SET NOT NULL;

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" varchar(36) PRIMARY KEY NOT NULL,
  "user_id" varchar(36) NOT NULL,
  "type" text NOT NULL,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "link" text,
  "read_at" timestamp,
  "created_at" timestamp DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_requests_requester_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "course_requests"
      ADD CONSTRAINT "course_requests_requester_user_id_users_id_fk"
      FOREIGN KEY ("requester_user_id") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_requests_student_id_students_id_fk'
  ) THEN
    ALTER TABLE "course_requests"
      ADD CONSTRAINT "course_requests_student_id_students_id_fk"
      FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_requests_child_id_children_id_fk'
  ) THEN
    ALTER TABLE "course_requests"
      ADD CONSTRAINT "course_requests_child_id_children_id_fk"
      FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_requests_parent_id_parents_id_fk'
  ) THEN
    ALTER TABLE "course_requests"
      ADD CONSTRAINT "course_requests_parent_id_parents_id_fk"
      FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_requests_teacher_id_teachers_id_fk'
  ) THEN
    ALTER TABLE "course_requests"
      ADD CONSTRAINT "course_requests_teacher_id_teachers_id_fk"
      FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notifications_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "notifications"
      ADD CONSTRAINT "notifications_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "course_requests_requester_user_id_idx" ON "course_requests" ("requester_user_id");
CREATE INDEX IF NOT EXISTS "course_requests_teacher_id_idx" ON "course_requests" ("teacher_id");
CREATE INDEX IF NOT EXISTS "course_requests_status_idx" ON "course_requests" ("status");
CREATE UNIQUE INDEX IF NOT EXISTS "favorites_user_teacher_unique" ON "favorites" ("user_id", "teacher_id");
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications" ("user_id");
CREATE INDEX IF NOT EXISTS "notifications_user_read_at_idx" ON "notifications" ("user_id", "read_at");
