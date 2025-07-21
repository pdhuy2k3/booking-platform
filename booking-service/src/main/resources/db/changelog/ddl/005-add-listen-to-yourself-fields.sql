-- liquibase formatted sql

-- changeset PhamDuyHuy:1752800000005-1
-- Add Listen to Yourself Pattern fields to booking_outbox_events
ALTER TABLE booking_outbox_events
    ADD COLUMN self_processed BOOLEAN NOT NULL DEFAULT FALSE;

-- changeset PhamDuyHuy:1752800000005-2
ALTER TABLE booking_outbox_events
    ADD COLUMN self_processed_at TIMESTAMP WITHOUT TIME ZONE;

-- changeset PhamDuyHuy:1752800000005-3
ALTER TABLE booking_outbox_events
    ADD COLUMN processing_attempts INTEGER NOT NULL DEFAULT 0;

-- changeset PhamDuyHuy:1752800000005-4
-- Create indexes for Listen to Yourself Pattern
CREATE INDEX idx_booking_outbox_self_processed ON booking_outbox_events (self_processed);
CREATE INDEX idx_booking_outbox_processing ON booking_outbox_events (self_processed, processing_attempts);
