-- ============================================================
-- Kavora Portfolio Tables Migration
-- 001_portfolio_tables.sql
-- ============================================================

-- ─── portfolio_settings ──────────────────────────────────────
-- One row per user. Stores bio, avatar, theme, social links.
CREATE TABLE IF NOT EXISTS portfolio_settings (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  slug          TEXT UNIQUE NOT NULL,
  bio           TEXT NOT NULL DEFAULT '',
  avatar_url    TEXT,
  show_contact_form  BOOLEAN NOT NULL DEFAULT false,
  show_testimonials  BOOLEAN NOT NULL DEFAULT false,
  theme_color   TEXT NOT NULL DEFAULT 'classic-navy',
  social_links  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── portfolio_projects ──────────────────────────────────────
-- Portfolio project entries. Free users limited to 3 (enforced in API).
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug          TEXT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  category      TEXT NOT NULL DEFAULT 'other',
  image_url     TEXT,
  live_url      TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_projects_user_id ON portfolio_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_slug ON portfolio_projects(slug);

-- ─── portfolio_testimonials ───────────────────────────────────
-- Pro-only. Testimonials from clients/colleagues.
CREATE TABLE IF NOT EXISTS portfolio_testimonials (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT '',
  company       TEXT NOT NULL DEFAULT '',
  avatar_url    TEXT,
  text          TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_testimonials_user_id ON portfolio_testimonials(user_id);

-- ─── portfolio_views ─────────────────────────────────────────
-- Analytics: one row per portfolio page view.
CREATE TABLE IF NOT EXISTS portfolio_views (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        TEXT NOT NULL,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent  TEXT,
  referrer    TEXT
);

CREATE INDEX IF NOT EXISTS idx_portfolio_views_slug ON portfolio_views(slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_views_slug_viewed_at ON portfolio_views(slug, viewed_at DESC);

-- ─── portfolio_contact_messages ───────────────────────────────
-- Stores contact form messages sent to portfolio owners.
CREATE TABLE IF NOT EXISTS portfolio_contact_messages (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug         TEXT NOT NULL,
  sender_name  TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_read      BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_portfolio_contact_slug ON portfolio_contact_messages(slug);

-- ─── updated_at trigger ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_portfolio_settings_updated_at
  BEFORE UPDATE ON portfolio_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Row Level Security ──────────────────────────────────────
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_contact_messages ENABLE ROW LEVEL SECURITY;

-- portfolio_settings policies
CREATE POLICY "Users can view their own portfolio settings"
  ON portfolio_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view portfolio settings by slug"
  ON portfolio_settings FOR SELECT
  USING (true);  -- portfolio settings are public (bio, theme, etc.)

CREATE POLICY "Users can insert their own portfolio settings"
  ON portfolio_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio settings"
  ON portfolio_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- portfolio_projects policies
CREATE POLICY "Public can view portfolio projects"
  ON portfolio_projects FOR SELECT
  USING (true);  -- projects are publicly readable

CREATE POLICY "Users can insert their own projects"
  ON portfolio_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON portfolio_projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON portfolio_projects FOR DELETE
  USING (auth.uid() = user_id);

-- portfolio_testimonials policies
CREATE POLICY "Public can view portfolio testimonials"
  ON portfolio_testimonials FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own testimonials"
  ON portfolio_testimonials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own testimonials"
  ON portfolio_testimonials FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own testimonials"
  ON portfolio_testimonials FOR DELETE
  USING (auth.uid() = user_id);

-- portfolio_views policies
CREATE POLICY "Anyone can insert a view"
  ON portfolio_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read view counts"
  ON portfolio_views FOR SELECT
  USING (true);

-- portfolio_contact_messages policies
CREATE POLICY "Anyone can insert a contact message"
  ON portfolio_contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Portfolio owner can read their messages"
  ON portfolio_contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_settings
      WHERE portfolio_settings.slug = portfolio_contact_messages.slug
        AND portfolio_settings.user_id = auth.uid()
    )
  );

-- ─── Storage Bucket ──────────────────────────────────────────
-- NOTE: Run this separately via Supabase CLI or Dashboard if SQL approach fails:
--   supabase storage create portfolio-assets --public
--
-- Attempt to create via SQL (works on some Supabase versions):
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-assets',
  'portfolio-assets',
  true,
  5242880,  -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Authenticated users can upload to their folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Public can read portfolio assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-assets');

CREATE POLICY "Users can update their own assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'portfolio-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'portfolio-assets'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
