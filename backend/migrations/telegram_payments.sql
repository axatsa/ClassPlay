-- Migration: Add Telegram payment fields to user_payments table
-- Run once: psql $DATABASE_URL -f migrations/telegram_payments.sql

ALTER TABLE user_payments
    ADD COLUMN IF NOT EXISTS payment_code      VARCHAR UNIQUE,
    ADD COLUMN IF NOT EXISTS screenshot_url    VARCHAR,
    ADD COLUMN IF NOT EXISTS telegram_user_id  INTEGER,
    ADD COLUMN IF NOT EXISTS telegram_username VARCHAR,
    ADD COLUMN IF NOT EXISTS admin_notes       VARCHAR,
    ADD COLUMN IF NOT EXISTS code_expires_at   TIMESTAMP,
    ADD COLUMN IF NOT EXISTS verified_at       TIMESTAMP;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_payments_payment_code      ON user_payments(payment_code);
CREATE INDEX IF NOT EXISTS idx_user_payments_telegram_user_id  ON user_payments(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_user_payments_user_id_status    ON user_payments(user_id, status);
