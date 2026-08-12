-- =============================================================================
-- FitTrack Routine Dashboard — Database Schema
-- =============================================================================
-- Run manually in Supabase SQL Editor.
-- Safe to re-run: functions/triggers use OR REPLACE, policies use DROP IF EXISTS,
-- tables/indexes use IF NOT EXISTS.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- EXTENSION
-- Ensures gen_random_uuid() is available. No-op if already installed.
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =============================================================================
-- UTILITY FUNCTIONS & TRIGGERS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- set_updated_at — reusable BEFORE UPDATE trigger applied to every table.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- =============================================================================
-- TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- profiles
-- 1:1 with auth.users. Created automatically by handle_new_user() below.
-- UNIQUE (id, user_id) is intentionally absent — profiles.id IS the user id.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS profiles (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text,
  display_name  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-insert a profile row when a new auth user signs up.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta_name text;
BEGIN
  meta_name := NULLIF(
    TRIM(
      COALESCE(
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.raw_user_meta_data ->> 'name',
        NEW.raw_user_meta_data ->> 'display_name'
      )
    ),
    ''
  );

  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(meta_name, split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ---------------------------------------------------------------------------
-- routines
-- A named training programme owned by a user.
--
-- source CHECK:    'manual' | 'excel'
-- is_active:       at most one active routine per user, enforced by the
--                  partial unique index below (idx_routines_one_active_per_user).
--
-- UNIQUE (id, user_id) is required so child tables (routine_days,
-- workout_sessions) can declare composite foreign keys that guarantee
-- their own user_id always matches the parent row's user_id.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS routines (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  source      text        NOT NULL DEFAULT 'manual'
                          CHECK (source IN ('manual', 'excel')),
  is_active   boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  -- Enables composite FK references from child tables.
  UNIQUE (id, user_id)
);

CREATE OR REPLACE TRIGGER trg_routines_updated_at
  BEFORE UPDATE ON routines
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ---------------------------------------------------------------------------
-- routine_days
-- One row per training day within a routine (e.g. "Monday — Glutes").
--
-- Composite FK (routine_id, user_id) → routines(id, user_id) guarantees
-- that a day cannot reference a routine owned by a different user, even
-- if someone writes directly to the DB with a service-role key.
--
-- UNIQUE (id, user_id) enables composite FK references from routine_exercises
-- and workout_sessions.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS routine_days (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id    uuid        NOT NULL,
  name          text        NOT NULL,
  focus         text,
  original_name text,
  sort_order    integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  CHECK (sort_order >= 0),
  FOREIGN KEY (routine_id, user_id) REFERENCES routines(id, user_id) ON DELETE CASCADE,
  UNIQUE (id, user_id)
);

CREATE OR REPLACE TRIGGER trg_routine_days_updated_at
  BEFORE UPDATE ON routine_days
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ---------------------------------------------------------------------------
-- routine_exercises
-- One row per exercise within a day.
--
-- prescription: raw string, e.g. "4x8-10 @ RPE 8".
-- planned_sets, target_reps, weight, rest_time: parsed from prescription
-- at import time for convenience; may be NULL if unparseable.
-- muscle_group: optional per-exercise target muscle, set from the routine editor.
--
-- Composite FK (routine_day_id, user_id) → routine_days(id, user_id).
-- UNIQUE (id, user_id) enables composite FK reference from workout_set_logs.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS routine_exercises (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_day_id   uuid        NOT NULL,
  name             text        NOT NULL,
  prescription     text        NOT NULL,
  planned_sets     integer,
  target_reps      text,
  weight           text,
  rest_time        text,
  notes            text,
  muscle_group     text,
  sort_order       integer     NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  CHECK (sort_order >= 0),
  CHECK (planned_sets IS NULL OR planned_sets > 0),
  FOREIGN KEY (routine_day_id, user_id) REFERENCES routine_days(id, user_id) ON DELETE CASCADE,
  UNIQUE (id, user_id)
);

CREATE OR REPLACE TRIGGER trg_routine_exercises_updated_at
  BEFORE UPDATE ON routine_exercises
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ---------------------------------------------------------------------------
-- workout_sessions
-- One row per time a user starts working through a routine day.
--
-- status CHECK: 'in_progress' | 'completed' | 'cancelled'
--
-- Both routine_id and routine_day_id are stored so sessions can be filtered
-- by either without an extra join.
--
-- Composite FKs enforce that the session's routine and day both belong to the
-- same user as the session itself.
--
-- UNIQUE (id, user_id) enables composite FK reference from workout_set_logs.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS workout_sessions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id       uuid        NOT NULL,
  routine_day_id   uuid        NOT NULL,
  session_date     date        NOT NULL DEFAULT CURRENT_DATE,
  status           text        NOT NULL DEFAULT 'in_progress'
                               CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  FOREIGN KEY (routine_id, user_id)     REFERENCES routines(id, user_id)      ON DELETE CASCADE,
  FOREIGN KEY (routine_day_id, user_id) REFERENCES routine_days(id, user_id)  ON DELETE CASCADE,
  UNIQUE (id, user_id)
);

CREATE OR REPLACE TRIGGER trg_workout_sessions_updated_at
  BEFORE UPDATE ON workout_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ---------------------------------------------------------------------------
-- workout_set_logs
-- One row per set attempted in a workout session.
-- completed is toggled via the checkbox UI.
-- actual_reps is filled in when the user edits the rep count post-set.
-- target_reps, target_weight, and exercise_name are copied at session-creation
-- time for a stable historical record (the routine may change later).
--
-- Composite FKs enforce that both the session and the exercise belong to
-- the same user as the log row.
--
-- Unique index prevents duplicate set numbers for the same exercise within
-- a single session.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS workout_set_logs (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_session_id   uuid        NOT NULL,
  routine_exercise_id  uuid        NOT NULL,
  set_number           integer     NOT NULL,
  target_reps          text,
  target_weight        text,
  exercise_name        text,
  actual_reps          integer,
  completed            boolean     NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),

  CHECK (set_number > 0),
  CHECK (actual_reps IS NULL OR actual_reps >= 0),
  FOREIGN KEY (workout_session_id,  user_id) REFERENCES workout_sessions(id,  user_id) ON DELETE CASCADE,
  FOREIGN KEY (routine_exercise_id, user_id) REFERENCES routine_exercises(id, user_id) ON DELETE CASCADE
);

CREATE OR REPLACE TRIGGER trg_workout_set_logs_updated_at
  BEFORE UPDATE ON workout_set_logs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- INDEXES
-- =============================================================================

-- Per-user list queries and RLS policy evaluation.
CREATE INDEX IF NOT EXISTS idx_routines_user_id              ON routines(user_id);
CREATE INDEX IF NOT EXISTS idx_routines_user_id_is_active    ON routines(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_routine_days_user_id          ON routine_days(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_days_routine_id       ON routine_days(routine_id);

CREATE INDEX IF NOT EXISTS idx_routine_exercises_user_id     ON routine_exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_exercises_day_id      ON routine_exercises(routine_day_id);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id      ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_routine_id   ON workout_sessions(routine_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_day_id       ON workout_sessions(routine_day_id);

CREATE INDEX IF NOT EXISTS idx_workout_set_logs_user_id      ON workout_set_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_set_logs_session_id   ON workout_set_logs(workout_session_id);
CREATE INDEX IF NOT EXISTS idx_workout_set_logs_exercise_id  ON workout_set_logs(routine_exercise_id);

-- Enforces at most one active routine per user at the DB level.
CREATE UNIQUE INDEX IF NOT EXISTS idx_routines_one_active_per_user
  ON routines(user_id)
  WHERE is_active = true;

-- Prevents duplicate set numbers for the same exercise within one session.
CREATE UNIQUE INDEX IF NOT EXISTS idx_workout_set_logs_unique_set
  ON workout_set_logs(workout_session_id, routine_exercise_id, set_number);


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles: owner select" ON profiles;
CREATE POLICY "profiles: owner select"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: owner insert" ON profiles;
CREATE POLICY "profiles: owner insert"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: owner update" ON profiles;
CREATE POLICY "profiles: owner update"
  ON profiles FOR UPDATE
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: owner delete" ON profiles;
CREATE POLICY "profiles: owner delete"
  ON profiles FOR DELETE
  USING (auth.uid() = id);


-- ---------------------------------------------------------------------------
-- routines
-- ---------------------------------------------------------------------------

ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "routines: owner select" ON routines;
CREATE POLICY "routines: owner select"
  ON routines FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "routines: owner insert" ON routines;
CREATE POLICY "routines: owner insert"
  ON routines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "routines: owner update" ON routines;
CREATE POLICY "routines: owner update"
  ON routines FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "routines: owner delete" ON routines;
CREATE POLICY "routines: owner delete"
  ON routines FOR DELETE
  USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- routine_days
-- ---------------------------------------------------------------------------

ALTER TABLE routine_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "routine_days: owner select" ON routine_days;
CREATE POLICY "routine_days: owner select"
  ON routine_days FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "routine_days: owner insert" ON routine_days;
CREATE POLICY "routine_days: owner insert"
  ON routine_days FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "routine_days: owner update" ON routine_days;
CREATE POLICY "routine_days: owner update"
  ON routine_days FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "routine_days: owner delete" ON routine_days;
CREATE POLICY "routine_days: owner delete"
  ON routine_days FOR DELETE
  USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- routine_exercises
-- ---------------------------------------------------------------------------

ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "routine_exercises: owner select" ON routine_exercises;
CREATE POLICY "routine_exercises: owner select"
  ON routine_exercises FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "routine_exercises: owner insert" ON routine_exercises;
CREATE POLICY "routine_exercises: owner insert"
  ON routine_exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "routine_exercises: owner update" ON routine_exercises;
CREATE POLICY "routine_exercises: owner update"
  ON routine_exercises FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "routine_exercises: owner delete" ON routine_exercises;
CREATE POLICY "routine_exercises: owner delete"
  ON routine_exercises FOR DELETE
  USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- workout_sessions
-- ---------------------------------------------------------------------------

ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workout_sessions: owner select" ON workout_sessions;
CREATE POLICY "workout_sessions: owner select"
  ON workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "workout_sessions: owner insert" ON workout_sessions;
CREATE POLICY "workout_sessions: owner insert"
  ON workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "workout_sessions: owner update" ON workout_sessions;
CREATE POLICY "workout_sessions: owner update"
  ON workout_sessions FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "workout_sessions: owner delete" ON workout_sessions;
CREATE POLICY "workout_sessions: owner delete"
  ON workout_sessions FOR DELETE
  USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- workout_set_logs
-- ---------------------------------------------------------------------------

ALTER TABLE workout_set_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workout_set_logs: owner select" ON workout_set_logs;
CREATE POLICY "workout_set_logs: owner select"
  ON workout_set_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "workout_set_logs: owner insert" ON workout_set_logs;
CREATE POLICY "workout_set_logs: owner insert"
  ON workout_set_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "workout_set_logs: owner update" ON workout_set_logs;
CREATE POLICY "workout_set_logs: owner update"
  ON workout_set_logs FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "workout_set_logs: owner delete" ON workout_set_logs;
CREATE POLICY "workout_set_logs: owner delete"
  ON workout_set_logs FOR DELETE
  USING (auth.uid() = user_id);
