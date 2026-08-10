-- Add display_name to profiles and seed it on signup / backfill.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS display_name text;

-- Prefer Google/OAuth name metadata, then email local-part.
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

-- Existing rows: keep email, fill empty display_name from email local-part.
UPDATE profiles
SET display_name = split_part(email, '@', 1)
WHERE display_name IS NULL
  AND email IS NOT NULL
  AND email <> '';
