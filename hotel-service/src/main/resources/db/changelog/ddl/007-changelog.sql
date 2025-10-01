-- liquibase formatted sql

-- changeset PhamDuyHuy:1759319297707-1
ALTER TABLE hotel_outbox_events
    DROP COLUMN payload;

-- changeset PhamDuyHuy:1759319297707-2
ALTER TABLE hotel_outbox_events
    ADD payload JSONB;

