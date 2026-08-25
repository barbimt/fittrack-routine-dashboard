-- Ownership columns default to the authenticated user so inserts need not
-- (and should not) accept a client-supplied user_id.
ALTER TABLE public.routines
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE public.routine_days
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE public.routine_exercises
  ALTER COLUMN user_id SET DEFAULT auth.uid();
