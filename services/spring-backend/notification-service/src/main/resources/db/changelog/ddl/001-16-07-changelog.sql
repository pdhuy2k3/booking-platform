-- liquibase formatted sql

-- changeset PhamDuyHuy:1752647064726-1
CREATE TABLE notification_outbox_events
(
    id             UUID         NOT NULL,
    aggregate_type VARCHAR(50)  NOT NULL,
    aggregate_id   VARCHAR(100) NOT NULL,
    event_type     VARCHAR(100) NOT NULL,
    payload        TEXT,
    created_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT pk_notification_outbox_events PRIMARY KEY (id)
);

-- changeset PhamDuyHuy:1752647064726-2
CREATE INDEX idx_notification_outbox_aggregate ON notification_outbox_events (aggregate_type, aggregate_id);

-- changeset PhamDuyHuy:1752647064726-3
CREATE INDEX idx_notification_outbox_created_at ON notification_outbox_events (created_at);

-- changeset PhamDuyHuy:1752647064726-4
CREATE INDEX idx_notification_outbox_event_type ON notification_outbox_events (event_type);

-- changeset PhamDuyHuy:1752647064726-5
DROP TABLE outbox CASCADE;

