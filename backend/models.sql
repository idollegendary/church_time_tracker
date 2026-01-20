-- Postgres schema (initial)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE church (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  church_id UUID REFERENCES church(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE preacher (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  church_id UUID REFERENCES church(id) ON DELETE CASCADE
);

CREATE TABLE "session" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES church(id) ON DELETE CASCADE,
  preacher_id UUID REFERENCES preacher(id),
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  duration_sec INT GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (end_at - start_at))::int) STORED,
  service_type TEXT,
  notes TEXT,
  created_by UUID REFERENCES "user"(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_session_church_start ON "session" (church_id, start_at);
CREATE INDEX idx_session_preacher_start ON "session" (preacher_id, start_at);
