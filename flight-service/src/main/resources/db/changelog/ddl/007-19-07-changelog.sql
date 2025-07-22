-- liquibase formatted sql

-- changeset PhamDuyHuy:1752882512156-1
ALTER TABLE flight_outbox_events
    ADD processing_attempts INTEGER;
ALTER TABLE flight_outbox_events
    ADD self_processed BOOLEAN;
ALTER TABLE flight_outbox_events
    ADD self_processed_at TIMESTAMP WITHOUT TIME ZONE;

-- changeset PhamDuyHuy:1752882512156-2
ALTER TABLE flight_outbox_events
    ALTER COLUMN processing_attempts SET NOT NULL;

-- changeset PhamDuyHuy:1752882512156-4
ALTER TABLE flight_outbox_events
    ALTER COLUMN self_processed SET NOT NULL;

