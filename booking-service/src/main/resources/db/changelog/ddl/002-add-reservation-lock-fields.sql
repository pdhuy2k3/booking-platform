-- Liquibase formatted SQL
-- changeset bookings:002-add-reservation-lock-fields
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS reservation_locked_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reservation_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reservation_lock_id VARCHAR(120);
