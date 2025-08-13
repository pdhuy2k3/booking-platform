-- liquibase formatted sql

-- changeset PhamDuyHuy:1755101344052-3
CREATE TABLE hotel_outbox_events
(
    id             UUID                        NOT NULL,
    aggregate_type VARCHAR(50)                 NOT NULL,
    aggregate_id   VARCHAR(100)                NOT NULL,
    event_type     VARCHAR(100)                NOT NULL,
    payload        TEXT,
    created_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT pk_hotel_outbox_events PRIMARY KEY (id)
);

-- changeset PhamDuyHuy:1755101344052-4
CREATE INDEX idx_hotel_outbox_aggregate ON hotel_outbox_events (aggregate_type, aggregate_id);

-- changeset PhamDuyHuy:1755101344052-5
CREATE INDEX idx_hotel_outbox_created_at ON hotel_outbox_events (created_at);

-- changeset PhamDuyHuy:1755101344052-6
CREATE INDEX idx_hotel_outbox_event_type ON hotel_outbox_events (event_type);

-- changeset PhamDuyHuy:1755101344052-1
ALTER TABLE room_types
    ALTER COLUMN hotel_id DROP NOT NULL;

-- changeset PhamDuyHuy:1755101344052-2
ALTER TABLE rooms
    ALTER COLUMN room_type_id DROP NOT NULL;

