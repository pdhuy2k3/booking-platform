-- liquibase formatted sql

-- changeset PhamDuyHuy:1752800000006-1
-- Add event_id column to hotel_outbox_events
ALTER TABLE hotel_outbox_events
    ADD COLUMN event_id VARCHAR(36);

-- changeset PhamDuyHuy:1752800000006-2
-- Populate event_id for existing records
UPDATE hotel_outbox_events 
SET event_id = CAST(id AS VARCHAR(36))
WHERE event_id IS NULL;

-- changeset PhamDuyHuy:1752800000006-3
-- Make event_id NOT NULL and UNIQUE
ALTER TABLE hotel_outbox_events
    ALTER COLUMN event_id SET NOT NULL;

-- changeset PhamDuyHuy:1752800000006-4
ALTER TABLE hotel_outbox_events
    ADD CONSTRAINT uk_hotel_outbox_event_id UNIQUE (event_id);

-- changeset PhamDuyHuy:1752800000006-5
-- Create index for event_id
CREATE INDEX idx_hotel_outbox_event_id ON hotel_outbox_events (event_id);
