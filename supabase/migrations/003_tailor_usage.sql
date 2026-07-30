-- ============================================================
-- Tailor usage metering
-- 003_tailor_usage.sql
--
-- Tracks how many tailored resume versions a user has generated, mirroring the
-- existing profiles.suggest_used counter. Written to be safe to re-apply.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tailor_used integer NOT NULL DEFAULT 0;

-- ADD CONSTRAINT has no IF NOT EXISTS, so guard on the catalog instead.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'profiles'::regclass
      AND conname = 'profiles_tailor_used_nonnegative'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_tailor_used_nonnegative
      CHECK (tailor_used >= 0);
  END IF;
END $$;
