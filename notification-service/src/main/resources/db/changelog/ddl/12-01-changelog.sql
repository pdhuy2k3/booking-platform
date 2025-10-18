-- liquibase formatted sql

-- changeset PhamDuyHuy:1760206489997-1
ALTER TABLE notification_outbox_events DROP COLUMN payload;

-- changeset PhamDuyHuy:1760206489997-2
ALTER TABLE notification_outbox_events
    ADD payload JSONB;

