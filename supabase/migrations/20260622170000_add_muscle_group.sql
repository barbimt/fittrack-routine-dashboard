-- =============================================================================
-- Add per-exercise muscle group
-- =============================================================================
-- routine_exercises.muscle_group: optional target muscle for an exercise, set
-- from the routine editor. NULL for exercises imported before this column or
-- left unset. Inherits the existing RLS policies on routine_exercises.
-- =============================================================================

ALTER TABLE routine_exercises
  ADD COLUMN IF NOT EXISTS muscle_group text;
