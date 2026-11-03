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
-- prescription: display string generated from routine_exercise_sets
-- (e.g. "W1x15 20kg-3x8 60kg"). planned_sets / target_reps / weight are
-- deprecated copies kept in sync for one release.
-- muscle_group (primary) / muscle_groups_secondary: slugs, see the
-- NORMALIZED TRAINING DATA section at the end of this file.
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


-- =============================================================================
-- NORMALIZED TRAINING DATA
-- Same as migrations/20261103130000_normalize_training_data.sql (idempotent).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- routine_exercises: muscle slugs + rest in seconds
-- ---------------------------------------------------------------------------

ALTER TABLE routine_exercises
  ADD COLUMN IF NOT EXISTS muscle_groups_secondary text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS rest_seconds integer;

UPDATE routine_exercises
SET muscle_group = CASE lower(trim(muscle_group))
    WHEN 'glutes'     THEN 'glutes'
    WHEN 'hamstrings' THEN 'hamstrings'
    WHEN 'quads'      THEN 'quads'
    WHEN 'calves'     THEN 'calves'
    WHEN 'chest'      THEN 'chest'
    WHEN 'back'       THEN 'back'
    WHEN 'shoulders'  THEN 'shoulders'
    WHEN 'biceps'     THEN 'biceps'
    WHEN 'triceps'    THEN 'triceps'
    WHEN 'core'       THEN 'core'
    WHEN 'forearms'   THEN 'forearms'
    WHEN 'full body'  THEN 'full_body'
    WHEN 'full_body'  THEN 'full_body'
    WHEN 'cardio'     THEN 'cardio'
    ELSE 'other'
  END
WHERE muscle_group IS NOT NULL;

UPDATE routine_exercises
SET rest_seconds = CASE
    WHEN rest_time ~* '^\s*\d+\s*(s|sec|secs|seconds?)?\s*$'
      THEN substring(rest_time FROM '\d+')::integer
    WHEN rest_time ~* '^\s*\d+\s*(m|min|mins|minutes?)\s*$'
      THEN substring(rest_time FROM '\d+')::integer * 60
    ELSE NULL
  END
WHERE rest_seconds IS NULL AND rest_time IS NOT NULL;

ALTER TABLE routine_exercises
  DROP CONSTRAINT IF EXISTS routine_exercises_muscle_group_check,
  DROP CONSTRAINT IF EXISTS routine_exercises_muscle_groups_secondary_check,
  DROP CONSTRAINT IF EXISTS routine_exercises_rest_seconds_check;

ALTER TABLE routine_exercises
  ADD CONSTRAINT routine_exercises_muscle_group_check CHECK (
    muscle_group IS NULL OR muscle_group IN (
      'glutes', 'hamstrings', 'quads', 'calves', 'chest', 'back', 'shoulders',
      'biceps', 'triceps', 'core', 'forearms', 'full_body', 'cardio', 'other'
    )
  ),
  ADD CONSTRAINT routine_exercises_muscle_groups_secondary_check CHECK (
    muscle_groups_secondary <@ ARRAY[
      'glutes', 'hamstrings', 'quads', 'calves', 'chest', 'back', 'shoulders',
      'biceps', 'triceps', 'core', 'forearms', 'full_body', 'cardio', 'other'
    ]::text[]
  ),
  ADD CONSTRAINT routine_exercises_rest_seconds_check CHECK (
    rest_seconds IS NULL OR rest_seconds >= 0
  );


-- ---------------------------------------------------------------------------
-- routine_exercise_sets
-- One row per planned set. reps_min = reps_max for a fixed target; a range
-- such as 8-10 is stored as 8 / 10. set_type 'warmup' is excluded from volume.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS routine_exercise_sets (
  id                   uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid          NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_exercise_id  uuid          NOT NULL,
  set_number           integer       NOT NULL,
  set_type             text          NOT NULL DEFAULT 'working'
                                     CHECK (set_type IN ('warmup', 'working', 'drop')),
  reps_min             integer,
  reps_max             integer,
  target_weight_kg     numeric(6,2),
  created_at           timestamptz   NOT NULL DEFAULT now(),
  updated_at           timestamptz   NOT NULL DEFAULT now(),

  CHECK (set_number > 0),
  CHECK (reps_min IS NULL OR reps_min > 0),
  CHECK (reps_max IS NULL OR reps_max > 0),
  CHECK (reps_min IS NULL OR reps_max IS NULL OR reps_max >= reps_min),
  CHECK (target_weight_kg IS NULL OR target_weight_kg >= 0),
  FOREIGN KEY (routine_exercise_id, user_id) REFERENCES routine_exercises(id, user_id) ON DELETE CASCADE,
  UNIQUE (routine_exercise_id, set_number)
);

CREATE OR REPLACE TRIGGER trg_routine_exercise_sets_updated_at
  BEFORE UPDATE ON routine_exercise_sets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_routine_exercise_sets_user_id
  ON routine_exercise_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_exercise_sets_exercise_id
  ON routine_exercise_sets(routine_exercise_id);

ALTER TABLE routine_exercise_sets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "routine_exercise_sets: owner select" ON routine_exercise_sets;
CREATE POLICY "routine_exercise_sets: owner select"
  ON routine_exercise_sets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "routine_exercise_sets: owner insert" ON routine_exercise_sets;
CREATE POLICY "routine_exercise_sets: owner insert"
  ON routine_exercise_sets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "routine_exercise_sets: owner update" ON routine_exercise_sets;
CREATE POLICY "routine_exercise_sets: owner update"
  ON routine_exercise_sets FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "routine_exercise_sets: owner delete" ON routine_exercise_sets;
CREATE POLICY "routine_exercise_sets: owner delete"
  ON routine_exercise_sets FOR DELETE
  USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- workout_set_logs: numeric targets, actual load, muscle snapshot
-- ---------------------------------------------------------------------------

ALTER TABLE workout_set_logs
  ADD COLUMN IF NOT EXISTS set_type text NOT NULL DEFAULT 'working',
  ADD COLUMN IF NOT EXISTS target_reps_min integer,
  ADD COLUMN IF NOT EXISTS target_reps_max integer,
  ADD COLUMN IF NOT EXISTS target_weight_kg numeric(6,2),
  ADD COLUMN IF NOT EXISTS actual_weight_kg numeric(6,2),
  ADD COLUMN IF NOT EXISTS muscle_group text,
  ADD COLUMN IF NOT EXISTS muscle_groups_secondary text[] NOT NULL DEFAULT '{}';

ALTER TABLE workout_set_logs
  DROP CONSTRAINT IF EXISTS workout_set_logs_set_type_check,
  DROP CONSTRAINT IF EXISTS workout_set_logs_target_weight_kg_check,
  DROP CONSTRAINT IF EXISTS workout_set_logs_actual_weight_kg_check;

ALTER TABLE workout_set_logs
  ADD CONSTRAINT workout_set_logs_set_type_check
    CHECK (set_type IN ('warmup', 'working', 'drop')),
  ADD CONSTRAINT workout_set_logs_target_weight_kg_check
    CHECK (target_weight_kg IS NULL OR target_weight_kg >= 0),
  ADD CONSTRAINT workout_set_logs_actual_weight_kg_check
    CHECK (actual_weight_kg IS NULL OR actual_weight_kg >= 0);

-- "60kg", "7,5 kg" → 60 / 7.5. Values that are not a single number stay NULL.
UPDATE workout_set_logs
SET target_weight_kg = substring(replace(target_weight, ',', '.') FROM '^\s*(\d+(?:\.\d+)?)\s*(?:kg)?\s*$')::numeric
WHERE target_weight_kg IS NULL AND target_weight IS NOT NULL;

UPDATE workout_set_logs
SET
  target_reps_min = substring(target_reps FROM '^\s*(\d+)')::integer,
  target_reps_max = COALESCE(
    substring(target_reps FROM '^\s*\d+\s*-\s*(\d+)\s*$')::integer,
    substring(target_reps FROM '^\s*(\d+)')::integer
  )
WHERE target_reps_min IS NULL AND target_reps ~ '^\s*\d+';

UPDATE workout_set_logs wsl
SET muscle_group = re.muscle_group,
    muscle_groups_secondary = re.muscle_groups_secondary
FROM routine_exercises re
WHERE wsl.routine_exercise_id = re.id
  AND wsl.muscle_group IS NULL;


-- ---------------------------------------------------------------------------
-- v_set_facts — dashboard-ready fact table (one row per logged set)
-- volume_kg counts completed non-warmup sets only; e1rm_kg uses Epley.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW v_set_facts
WITH (security_invoker = true)
AS
SELECT
  l.id,
  l.user_id,
  s.id                    AS workout_session_id,
  s.session_date,
  s.status                AS session_status,
  l.routine_exercise_id,
  l.exercise_name,
  l.muscle_group,
  l.muscle_groups_secondary,
  l.set_number,
  l.set_type,
  l.target_reps_min,
  l.target_reps_max,
  l.target_weight_kg,
  l.actual_reps,
  l.actual_weight_kg,
  l.completed,
  CASE
    WHEN l.completed AND l.set_type <> 'warmup'
      THEN COALESCE(l.actual_reps, 0) * COALESCE(l.actual_weight_kg, 0)
  END AS volume_kg,
  CASE
    WHEN l.completed AND l.actual_reps > 0 AND l.actual_weight_kg > 0
      THEN round(l.actual_weight_kg * (1 + l.actual_reps / 30.0), 2)
  END AS e1rm_kg
FROM workout_set_logs l
JOIN workout_sessions s
  ON s.id = l.workout_session_id
 AND s.user_id = l.user_id;

-- Progress dashboard: one aggregated payload per user.
-- SECURITY INVOKER so RLS on workout_sessions / workout_set_logs still applies.
-- The same jsonb feeds the charts and the AI export.

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_session_date
  ON workout_sessions (user_id, session_date DESC);

CREATE OR REPLACE FUNCTION public.progress_dashboard(p_weeks integer DEFAULT 12)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $function$
DECLARE
  result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object(
      'schemaVersion', 1,
      'generatedAt', now(),
      'window', jsonb_build_object(
        'weeks', 12,
        'from', CURRENT_DATE,
        'to', CURRENT_DATE,
        'comparisonWeeks', 4
      ),
      'units', jsonb_build_object('weight', 'kg', 'tonnage', 'kg', 'e1rm', 'kg'),
      'definitions', jsonb_build_object(
        'hardSet', 'A completed set whose type is not warmup.',
        'tonnageKg', 'Reps times kilograms, only when a hard set has both values.',
        'e1rmKg', 'Epley estimate: weight * (1 + reps / 30), only for 1 to 12 reps with weight.',
        'workout', 'A non-cancelled session with at least one hard set.',
        'adherence', 'Workouts in the selected period divided by active routine days times the length of that period. Uses the current active routine.',
        'personalRecord', 'A set whose e1RM is higher than every earlier set of the same exercise name.'
      ),
      'notTracked', jsonb_build_array(
        'RPE or reps in reserve',
        'Body weight',
        'Actual rest time',
        'Secondary muscle credit'
      ),
      'plan', jsonb_build_object(
        'activeRoutineDays', 0,
        'comparisonWeeks', 4,
        'plannedSessions', 0
      ),
      'kpis', jsonb_build_object(
        'recent', jsonb_build_object('workouts', 0, 'hardSets', 0, 'tonnageKg', 0, 'trainingDays', 0, 'adherence', null),
        'previous', jsonb_build_object('workouts', 0, 'hardSets', 0, 'tonnageKg', 0, 'trainingDays', 0, 'adherence', null)
      ),
      'weeks', '[]'::jsonb,
      'muscles', '[]'::jsonb,
      'exercises', '[]'::jsonb,
      'personalRecords', '[]'::jsonb,
      'recentSessions', '[]'::jsonb
    );
  END IF;

  WITH
  params AS (
    SELECT
      auth.uid() AS user_id,
      LEAST(GREATEST(COALESCE(p_weeks, 12), 4), 52) AS weeks,
      date_trunc('week', CURRENT_DATE)::date AS current_week
  ),
  bounds AS (
    SELECT
      user_id,
      weeks,
      weeks AS comparison_weeks,
      current_week,
      (current_week - ((weeks - 1) * 7))::date AS window_start,
      CURRENT_DATE AS window_end,
      (current_week - ((weeks - 1) * 7))::date AS recent_start,
      ((current_week - ((weeks - 1) * 7)) - (weeks * 7))::date AS previous_start
    FROM params
  ),
  history AS (
    SELECT
      b.*,
      LEAST(b.window_start, b.previous_start) AS history_start
    FROM bounds b
  ),
  weeks AS (
    SELECT generate_series(h.window_start, h.current_week, interval '7 days')::date AS week_start
    FROM history h
  ),
  facts AS (
    SELECT
      s.id AS session_id,
      s.session_date,
      s.status,
      COALESCE(
        NULLIF(trim(d.original_name), ''),
        NULLIF(trim(d.name), ''),
        'Workout'
      ) AS day_name,
      NULLIF(trim(l.exercise_name), '') AS exercise_name,
      lower(NULLIF(trim(l.exercise_name), '')) AS exercise_key,
      COALESCE(NULLIF(trim(l.muscle_group), ''), 'unassigned') AS muscle_group,
      date_trunc('week', s.session_date)::date AS week_start,
      CASE
        WHEN l.completed AND l.set_type <> 'warmup' THEN 1
        ELSE 0
      END AS hard_set,
      CASE
        WHEN l.completed
          AND l.set_type <> 'warmup'
          AND l.actual_reps IS NOT NULL
          AND l.actual_weight_kg IS NOT NULL
          THEN l.actual_reps * l.actual_weight_kg
        ELSE 0
      END AS tonnage_kg,
      CASE
        WHEN l.completed
          AND l.actual_reps BETWEEN 1 AND 12
          AND l.actual_weight_kg > 0
          THEN round(l.actual_weight_kg * (1 + l.actual_reps / 30.0), 2)
      END AS e1rm_kg,
      l.actual_reps,
      l.actual_weight_kg,
      l.id AS set_id
    FROM history h
    JOIN workout_sessions s
      ON s.user_id = h.user_id
     AND s.status <> 'cancelled'
     AND s.session_date >= h.history_start
     AND s.session_date <= h.window_end
    JOIN workout_set_logs l
      ON l.workout_session_id = s.id
     AND l.user_id = s.user_id
    LEFT JOIN routine_days d
      ON d.id = s.routine_day_id
     AND d.user_id = s.user_id
  ),
  week_stats AS (
    SELECT
      w.week_start,
      count(DISTINCT f.session_id) FILTER (WHERE f.hard_set = 1)::int AS workouts,
      COALESCE(sum(f.hard_set), 0)::int AS hard_sets,
      COALESCE(round(sum(f.tonnage_kg), 1), 0) AS tonnage_kg
    FROM weeks w
    LEFT JOIN facts f ON f.week_start = w.week_start
    GROUP BY w.week_start
  ),
  kpi AS (
    SELECT
      count(DISTINCT f.session_id) FILTER (
        WHERE f.hard_set = 1 AND f.session_date >= h.recent_start
      )::int AS recent_workouts,
      COALESCE(sum(f.hard_set) FILTER (
        WHERE f.session_date >= h.recent_start
      ), 0)::int AS recent_hard_sets,
      COALESCE(round(sum(f.tonnage_kg) FILTER (
        WHERE f.session_date >= h.recent_start
      ), 1), 0) AS recent_tonnage_kg,
      count(DISTINCT f.session_date) FILTER (
        WHERE f.hard_set = 1 AND f.session_date >= h.recent_start
      )::int AS recent_training_days,
      count(DISTINCT f.session_id) FILTER (
        WHERE f.hard_set = 1
          AND f.session_date >= h.previous_start
          AND f.session_date < h.recent_start
      )::int AS previous_workouts,
      COALESCE(sum(f.hard_set) FILTER (
        WHERE f.session_date >= h.previous_start
          AND f.session_date < h.recent_start
      ), 0)::int AS previous_hard_sets,
      COALESCE(round(sum(f.tonnage_kg) FILTER (
        WHERE f.session_date >= h.previous_start
          AND f.session_date < h.recent_start
      ), 1), 0) AS previous_tonnage_kg,
      count(DISTINCT f.session_date) FILTER (
        WHERE f.hard_set = 1
          AND f.session_date >= h.previous_start
          AND f.session_date < h.recent_start
      )::int AS previous_training_days
    FROM history h
    LEFT JOIN facts f ON true
    GROUP BY h.user_id
  ),
  plan AS (
    SELECT
      count(d.id)::int AS day_count,
      count(d.id)::int * h.comparison_weeks AS slots
    FROM history h
    LEFT JOIN routines r
      ON r.user_id = h.user_id
     AND r.is_active
    LEFT JOIN routine_days d
      ON d.routine_id = r.id
     AND d.user_id = r.user_id
    GROUP BY h.comparison_weeks
  ),
  muscles AS (
    SELECT
      f.muscle_group,
      COALESCE(sum(f.hard_set) FILTER (
        WHERE f.session_date >= h.recent_start
      ), 0)::int AS recent_hard_sets,
      COALESCE(sum(f.hard_set) FILTER (
        WHERE f.session_date >= h.previous_start
          AND f.session_date < h.recent_start
      ), 0)::int AS previous_hard_sets
    FROM facts f
    CROSS JOIN history h
    GROUP BY f.muscle_group, h.recent_start, h.previous_start
    HAVING COALESCE(sum(f.hard_set) FILTER (
        WHERE f.session_date >= h.recent_start
      ), 0) > 0
      OR COALESCE(sum(f.hard_set) FILTER (
        WHERE f.session_date >= h.previous_start
          AND f.session_date < h.recent_start
      ), 0) > 0
  ),
  exercise_rank AS (
    SELECT
      f.exercise_key,
      (array_agg(f.exercise_name ORDER BY f.session_date DESC, f.set_id DESC))[1] AS name,
      sum(f.hard_set)::int AS hard_sets,
      round(sum(f.tonnage_kg), 1) AS tonnage_kg,
      max(f.e1rm_kg) AS best_e1rm_kg
    FROM facts f
    CROSS JOIN history h
    WHERE f.exercise_key IS NOT NULL
      AND f.session_date >= h.window_start
      AND f.hard_set = 1
    GROUP BY f.exercise_key
    ORDER BY sum(f.hard_set) DESC, sum(f.tonnage_kg) DESC, name
    LIMIT 8
  ),
  exercise_week AS (
    SELECT
      f.exercise_key,
      f.week_start,
      max(f.e1rm_kg) AS e1rm_kg
    FROM facts f
    JOIN exercise_rank r ON r.exercise_key = f.exercise_key
    CROSS JOIN history h
    WHERE f.session_date >= h.window_start
    GROUP BY f.exercise_key, f.week_start
  ),
  e1rm_history AS (
    SELECT
      lower(trim(l.exercise_name)) AS exercise_key,
      trim(l.exercise_name) AS exercise_name,
      s.session_date,
      l.actual_weight_kg,
      l.actual_reps,
      round(l.actual_weight_kg * (1 + l.actual_reps / 30.0), 2) AS e1rm_kg,
      l.id
    FROM workout_set_logs l
    JOIN workout_sessions s
      ON s.id = l.workout_session_id
     AND s.user_id = l.user_id
    WHERE s.user_id = auth.uid()
      AND s.status <> 'cancelled'
      AND l.completed
      AND l.actual_reps BETWEEN 1 AND 12
      AND l.actual_weight_kg > 0
      AND NULLIF(trim(l.exercise_name), '') IS NOT NULL
  ),
  e1rm_ranked AS (
    SELECT
      exercise_name,
      session_date,
      actual_weight_kg,
      actual_reps,
      e1rm_kg,
      max(e1rm_kg) OVER (
        PARTITION BY exercise_key
        ORDER BY session_date, id
        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
      ) AS prev_best
    FROM e1rm_history
  ),
  records AS (
    SELECT
      exercise_name,
      e1rm_kg,
      session_date,
      actual_weight_kg,
      actual_reps
    FROM e1rm_ranked
    CROSS JOIN history h
    WHERE e1rm_kg > COALESCE(prev_best, 0)
      AND session_date >= h.window_start
    ORDER BY session_date DESC, e1rm_kg DESC
    LIMIT 5
  ),
  session_rank AS (
    SELECT
      f.session_id,
      f.session_date,
      f.day_name,
      f.status,
      sum(f.hard_set)::int AS hard_sets,
      round(sum(f.tonnage_kg), 1) AS tonnage_kg
    FROM facts f
    CROSS JOIN history h
    WHERE f.session_date >= h.window_start
    GROUP BY f.session_id, f.session_date, f.day_name, f.status
    HAVING sum(f.hard_set) > 0
    ORDER BY f.session_date DESC, f.session_id DESC
    LIMIT 8
  ),
  best_sets AS (
    SELECT DISTINCT ON (f.session_id, f.exercise_key)
      f.session_id,
      f.exercise_key,
      f.exercise_name AS name,
      f.actual_weight_kg,
      f.actual_reps
    FROM facts f
    JOIN session_rank s ON s.session_id = f.session_id
    WHERE f.hard_set = 1
      AND f.exercise_key IS NOT NULL
    ORDER BY
      f.session_id,
      f.exercise_key,
      f.e1rm_kg DESC NULLS LAST,
      f.actual_weight_kg DESC NULLS LAST,
      f.actual_reps DESC NULLS LAST
  ),
  session_exercise_totals AS (
    SELECT
      f.session_id,
      f.exercise_key,
      sum(f.hard_set)::int AS hard_sets
    FROM facts f
    WHERE f.hard_set = 1
      AND f.exercise_key IS NOT NULL
    GROUP BY f.session_id, f.exercise_key
  ),
  exercise_marks AS (
    SELECT
      f.exercise_key,
      (array_agg(f.exercise_name ORDER BY f.session_date DESC, f.set_id DESC)
        FILTER (WHERE f.session_date >= h.window_start))[1] AS name,
      max(f.e1rm_kg) FILTER (WHERE f.session_date >= h.window_start) AS current_e1rm,
      max(f.e1rm_kg) FILTER (
        WHERE f.session_date >= h.previous_start
          AND f.session_date < h.window_start
      ) AS previous_e1rm
    FROM facts f
    CROSS JOIN history h
    WHERE f.exercise_key IS NOT NULL
      AND f.hard_set = 1
      AND f.e1rm_kg IS NOT NULL
    GROUP BY f.exercise_key, h.window_start, h.previous_start
  ),
  best_gain AS (
    SELECT name, round(current_e1rm - previous_e1rm, 2) AS delta_kg
    FROM exercise_marks
    WHERE name IS NOT NULL
      AND previous_e1rm IS NOT NULL
      AND current_e1rm > previous_e1rm
    ORDER BY current_e1rm - previous_e1rm DESC, name
    LIMIT 1
  ),
  load_progress AS (
    SELECT
      count(*) FILTER (
        WHERE current_e1rm IS NOT NULL
          AND previous_e1rm IS NOT NULL
          AND current_e1rm > previous_e1rm
      )::int AS improved,
      count(*) FILTER (WHERE current_e1rm IS NOT NULL)::int AS tracked
    FROM exercise_marks
  )
  SELECT jsonb_build_object(
    'schemaVersion', 1,
    'generatedAt', now(),
    'window', jsonb_build_object(
      'weeks', h.weeks,
      'from', h.window_start,
      'to', h.window_end,
      'comparisonWeeks', h.comparison_weeks
    ),
    'units', jsonb_build_object('weight', 'kg', 'tonnage', 'kg', 'e1rm', 'kg'),
    'definitions', jsonb_build_object(
      'hardSet', 'A completed set whose type is not warmup.',
      'tonnageKg', 'Reps times kilograms, only when a hard set has both values.',
      'e1rmKg', 'Epley estimate: weight * (1 + reps / 30), only for 1 to 12 reps with weight.',
      'workout', 'A non-cancelled session with at least one hard set.',
      'adherence', 'Workouts in the selected period divided by active routine days times the length of that period. Uses the current active routine.',
      'personalRecord', 'A set whose e1RM is higher than every earlier set of the same exercise name.',
      'loadProgress', 'An exercise improved when its best estimated 1RM in this period is higher than in the previous period. The estimate combines weight and reps, so 50 kg for 12 reps can beat 50 kg for 8.'
    ),
    'notTracked', jsonb_build_array(
      'RPE or reps in reserve',
      'Body weight',
      'Waist and hip measurements',
      'Actual rest time',
      'Secondary muscle credit'
    ),
    'loadProgress', jsonb_build_object(
      'improved', COALESCE((SELECT improved FROM load_progress), 0),
      'tracked', COALESCE((SELECT tracked FROM load_progress), 0),
      'best', (
        SELECT jsonb_build_object(
          'exerciseName', g.name,
          'deltaKg', g.delta_kg
        )
        FROM best_gain g
      )
    ),
    'plan', jsonb_build_object(
      'activeRoutineDays', p.day_count,
      'comparisonWeeks', h.comparison_weeks,
      'plannedSessions', p.slots
    ),
    'kpis', jsonb_build_object(
      'recent', jsonb_build_object(
        'workouts', k.recent_workouts,
        'hardSets', k.recent_hard_sets,
        'tonnageKg', k.recent_tonnage_kg,
        'trainingDays', k.recent_training_days,
        'adherence', CASE
          WHEN p.slots = 0 THEN NULL
          ELSE round(k.recent_workouts::numeric / p.slots, 4)
        END
      ),
      'previous', jsonb_build_object(
        'workouts', k.previous_workouts,
        'hardSets', k.previous_hard_sets,
        'tonnageKg', k.previous_tonnage_kg,
        'trainingDays', k.previous_training_days,
        'adherence', CASE
          WHEN p.slots = 0 THEN NULL
          ELSE round(k.previous_workouts::numeric / p.slots, 4)
        END
      )
    ),
    'weeks', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'weekStart', w.week_start,
          'workouts', w.workouts,
          'hardSets', w.hard_sets,
          'tonnageKg', w.tonnage_kg
        ) ORDER BY w.week_start
      ), '[]'::jsonb)
      FROM week_stats w
    ),
    'muscles', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'muscleGroup', m.muscle_group,
          'recentHardSets', m.recent_hard_sets,
          'previousHardSets', m.previous_hard_sets
        ) ORDER BY m.recent_hard_sets DESC, m.muscle_group
      ), '[]'::jsonb)
      FROM muscles m
    ),
    'exercises', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'name', e.name,
          'hardSets', e.hard_sets,
          'tonnageKg', e.tonnage_kg,
          'bestE1rmKg', e.best_e1rm_kg,
          'weeklyBestE1rm', (
            SELECT COALESCE(jsonb_agg(
              jsonb_build_object(
                'weekStart', w.week_start,
                'e1rmKg', x.e1rm_kg
              ) ORDER BY w.week_start
            ), '[]'::jsonb)
            FROM weeks w
            LEFT JOIN exercise_week x
              ON x.exercise_key = e.exercise_key
             AND x.week_start = w.week_start
          )
        ) ORDER BY e.hard_sets DESC, e.tonnage_kg DESC, e.name
      ), '[]'::jsonb)
      FROM exercise_rank e
    ),
    'personalRecords', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'exerciseName', r.exercise_name,
          'e1rmKg', r.e1rm_kg,
          'sessionDate', r.session_date,
          'weightKg', r.actual_weight_kg,
          'reps', r.actual_reps
        ) ORDER BY r.session_date DESC, r.e1rm_kg DESC
      ), '[]'::jsonb)
      FROM records r
    ),
    'recentSessions', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'sessionDate', s.session_date,
          'dayName', s.day_name,
          'status', s.status,
          'hardSets', s.hard_sets,
          'tonnageKg', s.tonnage_kg,
          'exercises', (
            SELECT COALESCE(jsonb_agg(
              jsonb_build_object(
                'name', b.name,
                'hardSets', t.hard_sets,
                'bestWeightKg', b.actual_weight_kg,
                'bestReps', b.actual_reps
              ) ORDER BY b.name
            ), '[]'::jsonb)
            FROM best_sets b
            JOIN session_exercise_totals t
              ON t.session_id = b.session_id
             AND t.exercise_key = b.exercise_key
            WHERE b.session_id = s.session_id
          )
        ) ORDER BY s.session_date DESC, s.session_id DESC
      ), '[]'::jsonb)
      FROM session_rank s
    )
  )
  INTO result
  FROM history h
  CROSS JOIN kpi k
  CROSS JOIN plan p;

  RETURN result;
END;
$function$;

REVOKE ALL ON FUNCTION public.progress_dashboard(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.progress_dashboard(integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.progress_dashboard(integer) TO authenticated;
