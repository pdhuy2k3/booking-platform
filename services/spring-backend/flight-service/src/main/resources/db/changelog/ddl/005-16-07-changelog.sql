-- liquibase formatted sql

-- changeset PhamDuyHuy:1752647853240-1
CREATE TABLE flight_outbox_events
(
    id             UUID         NOT NULL,
    aggregate_type VARCHAR(50)  NOT NULL,
    aggregate_id   VARCHAR(100) NOT NULL,
    event_type     VARCHAR(100) NOT NULL,
    payload        TEXT,
    created_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT pk_flight_outbox_events PRIMARY KEY (id)
);

-- changeset PhamDuyHuy:1752647853240-2
CREATE INDEX idx_flight_outbox_aggregate ON flight_outbox_events (aggregate_type, aggregate_id);

-- changeset PhamDuyHuy:1752647853240-3
CREATE INDEX idx_flight_outbox_created_at ON flight_outbox_events (created_at);

-- changeset PhamDuyHuy:1752647853240-4
CREATE INDEX idx_flight_outbox_event_type ON flight_outbox_events (event_type);

