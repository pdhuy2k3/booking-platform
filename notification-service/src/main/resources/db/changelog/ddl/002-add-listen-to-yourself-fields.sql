-- liquibase formatted sql

-- changeset PhamDuyHuy:1752800000003-1
-- Add Listen to Yourself Pattern fields to notification_outbox_events
ALTER TABLE notification_outbox_events
    ADD COLUMN self_processed BOOLEAN NOT NULL DEFAULT FALSE;

-- changeset PhamDuyHuy:1752800000003-2
ALTER TABLE notification_outbox_events
    ADD COLUMN self_processed_at TIMESTAMP WITHOUT TIME ZONE;

-- changeset PhamDuyHuy:1752800000003-3
ALTER TABLE notification_outbox_events
    ADD COLUMN processing_attempts INTEGER NOT NULL DEFAULT 0;

-- changeset PhamDuyHuy:1752800000003-4
-- Create indexes for Listen to Yourself Pattern
CREATE INDEX idx_notification_outbox_self_processed ON notification_outbox_events (self_processed);
CREATE INDEX idx_notification_outbox_processing ON notification_outbox_events (self_processed, processing_attempts);
