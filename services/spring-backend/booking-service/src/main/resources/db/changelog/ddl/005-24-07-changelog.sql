-- liquibase formatted sql

-- changeset PhamDuyHuy:1753327989979-1
ALTER TABLE booking_services
    DROP CONSTRAINT fk_booking_services_on_booking;

-- changeset PhamDuyHuy:1753327989979-2
DROP TABLE booking_services CASCADE;

-- changeset PhamDuyHuy:1753327989979-9
ALTER TABLE booking_outbox_events
    DROP COLUMN processing_attempts;
ALTER TABLE booking_outbox_events
    DROP COLUMN self_processed;
ALTER TABLE booking_outbox_events
    DROP COLUMN self_processed_at;

