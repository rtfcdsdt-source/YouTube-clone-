-- Migration: add password-based auth (users.password_hash + sessions table)
-- Apply to an EXISTING database with:
--   psql "$DATABASE_URL" -f drizzle/0001_add_auth.sql
-- For a FRESH database, `npx drizzle-kit push` applies the schema directly.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text;

-- Backfill uniqueness on email for login/signup (skip if duplicates exist).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_unique'
  ) THEN
    ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE ("email");
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "token" text NOT NULL UNIQUE,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "sessions_token_idx" ON "sessions" ("token");
