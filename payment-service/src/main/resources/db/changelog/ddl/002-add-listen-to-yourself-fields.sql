-- liquibase formatted sql

-- changeset PhamDuyHuy:1752800000004-1
-- Add Listen to Yourself Pattern fields to payment_outbox_events
ALTER TABLE payment_outbox_events
    ADD COLUMN self_processed BOOLEAN NOT NULL DEFAULT FALSE;

-- changeset PhamDuyHuy:1752800000004-2
ALTER TABLE payment_outbox_events
    ADD COLUMN self_processed_at TIMESTAMP WITHOUT TIME ZONE;

-- changeset PhamDuyHuy:1752800000004-3
ALTER TABLE payment_outbox_events
    ADD COLUMN processing_attempts INTEGER NOT NULL DEFAULT 0;

-- changeset PhamDuyHuy:1752800000004-4
-- Create indexes for Listen to Yourself Pattern
CREATE INDEX idx_payment_outbox_self_processed ON payment_outbox_events (self_processed);
CREATE INDEX idx_payment_outbox_processing ON payment_outbox_events (self_processed, processing_attempts);
