-- =============================================================================
-- Reset workout session data (keeps routines + auth)
-- =============================================================================
-- Run in Supabase Dashboard → SQL Editor (service role bypasses RLS).
-- Use this to wipe fake sets/reps/saves from dashboard testing.
-- =============================================================================

DELETE FROM workout_set_logs;
DELETE FROM workout_sessions;

-- Verify
SELECT 'workout_set_logs' AS table_name, COUNT(*) AS rows FROM workout_set_logs
UNION ALL
SELECT 'workout_sessions', COUNT(*) FROM workout_sessions;
