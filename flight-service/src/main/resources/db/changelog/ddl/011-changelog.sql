-- liquibase formatted sql

-- changeset PhamDuyHuy:1759319200593-1
ALTER TABLE flight_outbox_events
    DROP COLUMN payload;

-- changeset PhamDuyHuy:1759319200593-2
ALTER TABLE flight_outbox_events
    ADD payload JSONB;

-- changeset PhamDuyHuy:1759319200593-3
ALTER TABLE flight_schedules
    ALTER COLUMN status TYPE VARCHAR(255) USING (status::VARCHAR(255));

