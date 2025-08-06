-- liquibase formatted sql

-- changeset PhamDuyHuy:1752647093531-6
ALTER TABLE payment_outbox_events
    ADD error_message TEXT;

-- changeset PhamDuyHuy:1752647093531-8
DROP TABLE outbox_events CASCADE;

-- changeset PhamDuyHuy:1752647093531-1
ALTER TABLE payment_outbox_events ALTER COLUMN aggregate_id TYPE VARCHAR(100) USING (aggregate_id::VARCHAR(100));

-- changeset PhamDuyHuy:1752647093531-2
ALTER TABLE payment_outbox_events ALTER COLUMN event_id TYPE VARCHAR(36) USING (event_id::VARCHAR(36));

-- changeset PhamDuyHuy:1752647093531-3
ALTER TABLE payment_outbox_events DROP COLUMN payload;

-- changeset PhamDuyHuy:1752647093531-4
ALTER TABLE payment_outbox_events
    ADD payload JSONB NOT NULL;

-- changeset PhamDuyHuy:1752647093531-5
ALTER TABLE payment_outbox_events ALTER COLUMN saga_id TYPE VARCHAR(36) USING (saga_id::VARCHAR(36));

