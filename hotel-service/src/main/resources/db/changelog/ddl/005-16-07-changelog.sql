-- liquibase formatted sql

-- changeset PhamDuyHuy:1752647868410-2
CREATE TABLE hotel_outbox_events
(
    id             UUID         NOT NULL,
    aggregate_type VARCHAR(50)  NOT NULL,
    aggregate_id   VARCHAR(100) NOT NULL,
    event_type     VARCHAR(100) NOT NULL,
    payload        TEXT,
    created_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT pk_hotel_outbox_events PRIMARY KEY (id)
);


-- changeset PhamDuyHuy:1752647868410-5
CREATE INDEX idx_hotel_outbox_aggregate ON hotel_outbox_events (aggregate_type, aggregate_id);

-- changeset PhamDuyHuy:1752647868410-6
CREATE INDEX idx_hotel_outbox_created_at ON hotel_outbox_events (created_at);

-- changeset PhamDuyHuy:1752647868410-7
CREATE INDEX idx_hotel_outbox_event_type ON hotel_outbox_events (event_type);

-- changeset PhamDuyHuy:1752647868410-9
DROP TABLE outbox CASCADE;

-- changeset PhamDuyHuy:1752647868410-10
DROP TABLE outbox_events CASCADE;

-- changeset PhamDuyHuy:1752647868410-1
ALTER TABLE rooms
    ALTER COLUMN room_type_id DROP NOT NULL;

