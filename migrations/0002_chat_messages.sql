CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" varchar(36) PRIMARY KEY NOT NULL,
  "sender_id" varchar(36) NOT NULL,
  "recipient_id" varchar(36) NOT NULL,
  "text" text,
  "attachment" json,
  "attachment_type" text DEFAULT 'text',
  "read_at" timestamp,
  "created_at" timestamp DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_sender_id_users_id_fk'
  ) THEN
    ALTER TABLE "chat_messages"
      ADD CONSTRAINT "chat_messages_sender_id_users_id_fk"
      FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_recipient_id_users_id_fk'
  ) THEN
    ALTER TABLE "chat_messages"
      ADD CONSTRAINT "chat_messages_recipient_id_users_id_fk"
      FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "chat_messages_sender_id_idx" ON "chat_messages" ("sender_id");
CREATE INDEX IF NOT EXISTS "chat_messages_recipient_id_idx" ON "chat_messages" ("recipient_id");
CREATE INDEX IF NOT EXISTS "chat_messages_conversation_idx" ON "chat_messages" ("sender_id", "recipient_id", "created_at");
