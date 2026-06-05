-- =============================================================================
-- Reset ALL app data for one user (keeps auth account)
-- =============================================================================
-- Replace the email below, then run in Supabase SQL Editor.
-- =============================================================================

DO $$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'barbitorres94@gmail.com';

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found. Update the email in this script.';
  END IF;

  DELETE FROM workout_set_logs WHERE user_id = target_user_id;
  DELETE FROM workout_sessions WHERE user_id = target_user_id;
  DELETE FROM routine_exercises WHERE user_id = target_user_id;
  DELETE FROM routine_days WHERE user_id = target_user_id;
  DELETE FROM routines WHERE user_id = target_user_id;
END $$;
