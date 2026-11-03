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
      'personalRecord', 'A set whose e1RM is higher than every earlier set of the same exercise name.'
    ),
    'notTracked', jsonb_build_array(
      'RPE or reps in reserve',
      'Body weight',
      'Actual rest time',
      'Secondary muscle credit'
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
