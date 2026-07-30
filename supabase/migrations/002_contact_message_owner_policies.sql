-- ============================================================
-- Contact message inbox
-- 002_contact_message_owner_policies.sql
--
-- 001 gave portfolio owners SELECT access only, so messages could be received
-- but never marked read or deleted. These policies back the inbox UI in the
-- portfolio editor.
-- ============================================================

DROP POLICY IF EXISTS "Portfolio owner can update their messages"
  ON portfolio_contact_messages;

CREATE POLICY "Portfolio owner can update their messages"
  ON portfolio_contact_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_settings
      WHERE portfolio_settings.slug = portfolio_contact_messages.slug
        AND portfolio_settings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolio_settings
      WHERE portfolio_settings.slug = portfolio_contact_messages.slug
        AND portfolio_settings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Portfolio owner can delete their messages"
  ON portfolio_contact_messages;

CREATE POLICY "Portfolio owner can delete their messages"
  ON portfolio_contact_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_settings
      WHERE portfolio_settings.slug = portfolio_contact_messages.slug
        AND portfolio_settings.user_id = auth.uid()
    )
  );

-- Inbox lists newest first and counts unread.
CREATE INDEX IF NOT EXISTS idx_portfolio_contact_slug_created_at
  ON portfolio_contact_messages(slug, created_at DESC);
