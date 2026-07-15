-- Snapshot exercise name and target weight on workout_set_logs at session time
-- so historical progress survives routine edits.

ALTER TABLE workout_set_logs
  ADD COLUMN IF NOT EXISTS target_weight text,
  ADD COLUMN IF NOT EXISTS exercise_name text;

-- Backfill existing logs from the current routine template (best-effort).
UPDATE workout_set_logs wsl
SET
  exercise_name = re.name,
  target_weight = re.weight
FROM routine_exercises re
WHERE wsl.routine_exercise_id = re.id
  AND (wsl.exercise_name IS NULL OR wsl.target_weight IS NULL);
