-- liquibase formatted sql

-- changeset PhamDuyHuy:1752763823901-1
ALTER TABLE booking_outbox_events
    ADD booking_id UUID;
ALTER TABLE booking_outbox_events
    ADD expires_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE booking_outbox_events
    ADD headers TEXT;
ALTER TABLE booking_outbox_events
    ADD partition_key VARCHAR(100);
ALTER TABLE booking_outbox_events
    ADD priority INTEGER;
ALTER TABLE booking_outbox_events
    ADD saga_id VARCHAR(36);
ALTER TABLE booking_outbox_events
    ADD topic VARCHAR(100);
ALTER TABLE booking_outbox_events
    ADD user_id UUID;

-- changeset PhamDuyHuy:1752763823901-6
ALTER TABLE booking_outbox_events
    ALTER COLUMN priority SET NOT NULL;

