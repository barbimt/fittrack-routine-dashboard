-- =============================================================================
-- Normalize training data: numeric loads, one row per planned set, muscle slugs
-- =============================================================================
-- * routine_exercise_sets: one row per planned set (source of truth for targets).
--   routine_exercises.prescription stays as a display string generated from
--   these rows; planned_sets / target_reps / weight are kept in sync for one
--   release and will be dropped later.
-- * routine_exercises.muscle_group becomes a controlled slug (primary muscle) and
--   muscle_groups_secondary holds optional secondary muscles.
-- * workout_set_logs gains numeric targets + actual_weight_kg and a muscle
--   snapshot so history survives routine edits.
-- * v_set_facts: one row per logged set with volume and estimated 1RM, for
--   dashboards. security_invoker keeps the owner-only RLS of the base tables.
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
