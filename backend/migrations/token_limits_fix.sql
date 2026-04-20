-- Migration: Fix token limits after deploying token system changes
-- Run ONCE after deploying the new code to production.

-- 1. Downgrade free users (no active paid subscription) from 100k → 30k
UPDATE users
SET tokens_limit = 30000
WHERE tokens_limit = 100000
  AND id NOT IN (
    SELECT DISTINCT user_id FROM user_subscriptions
    WHERE expires_at > NOW()
      AND plan IN ('pro', 'school')
  );

-- 2. Set correct limit for active Pro subscribers
UPDATE users
SET tokens_limit = 300000
WHERE id IN (
    SELECT DISTINCT user_id FROM user_subscriptions
    WHERE expires_at > NOW() AND plan = 'pro'
);

-- 3. Set correct limit for active School subscribers
UPDATE users
SET tokens_limit = 1500000
WHERE id IN (
    SELECT DISTINCT user_id FROM user_subscriptions
    WHERE expires_at > NOW() AND plan = 'school'
);

-- 4. Update DB default (if using Alembic with server_default)
-- ALTER TABLE users ALTER COLUMN tokens_limit SET DEFAULT 30000;

-- 5. Add custom_gemini_key column to organizations (new feature)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS custom_gemini_key VARCHAR;
