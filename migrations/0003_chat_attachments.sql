CREATE TABLE IF NOT EXISTS "chat_attachments" (
  "id" varchar(36) PRIMARY KEY NOT NULL,
  "uploader_id" varchar(36) NOT NULL,
  "type" text NOT NULL,
  "content_type" text NOT NULL,
  "file_name" text NOT NULL,
  "size" integer NOT NULL,
  "data" bytea NOT NULL,
  "created_at" timestamp DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_attachments_uploader_id_users_id_fk'
  ) THEN
    ALTER TABLE "chat_attachments"
      ADD CONSTRAINT "chat_attachments_uploader_id_users_id_fk"
      FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "chat_attachments_uploader_id_idx" ON "chat_attachments" ("uploader_id");
