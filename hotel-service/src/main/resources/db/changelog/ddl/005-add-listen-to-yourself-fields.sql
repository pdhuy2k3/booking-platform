-- liquibase formatted sql

-- changeset PhamDuyHuy:1752800000002-1
-- Add Listen to Yourself Pattern fields to hotel_outbox_events
ALTER TABLE hotel_outbox_events
    ADD COLUMN self_processed BOOLEAN NOT NULL DEFAULT FALSE;

-- changeset PhamDuyHuy:1752800000002-2
ALTER TABLE hotel_outbox_events
    ADD COLUMN self_processed_at TIMESTAMP WITHOUT TIME ZONE;

-- changeset PhamDuyHuy:1752800000002-3
ALTER TABLE hotel_outbox_events
    ADD COLUMN processing_attempts INTEGER NOT NULL DEFAULT 0;

-- changeset PhamDuyHuy:1752800000002-4
-- Create indexes for Listen to Yourself Pattern
CREATE INDEX idx_hotel_outbox_self_processed ON hotel_outbox_events (self_processed);
CREATE INDEX idx_hotel_outbox_processing ON hotel_outbox_events (self_processed, processing_attempts);
