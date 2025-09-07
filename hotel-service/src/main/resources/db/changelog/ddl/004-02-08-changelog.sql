-- liquibase formatted sql

-- changeset PhamDuyHuy:1757194259868-8
ALTER TABLE hotel_images
    DROP CONSTRAINT fk_hotel_images_on_hotel;

-- changeset PhamDuyHuy:1757194259868-9
ALTER TABLE room_images
    DROP CONSTRAINT fk_room_images_on_room;

-- changeset PhamDuyHuy:1757194259868-2
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

-- changeset PhamDuyHuy:1757194259868-3
ALTER TABLE hotels
    ADD is_active BOOLEAN;

-- changeset PhamDuyHuy:1757194259868-4
UPDATE hotels
SET is_active = TRUE
WHERE 1=1;

ALTER TABLE hotels
    ALTER COLUMN is_active SET NOT NULL;

-- changeset PhamDuyHuy:1757194259868-5
CREATE INDEX idx_hotel_outbox_aggregate ON hotel_outbox_events (aggregate_type, aggregate_id);

-- changeset PhamDuyHuy:1757194259868-6
CREATE INDEX idx_hotel_outbox_created_at ON hotel_outbox_events (created_at);

-- changeset PhamDuyHuy:1757194259868-7
CREATE INDEX idx_hotel_outbox_event_type ON hotel_outbox_events (event_type);

-- changeset PhamDuyHuy:1757194259868-10
DROP TABLE hotel_images CASCADE;

-- changeset PhamDuyHuy:1757194259868-11
DROP TABLE room_images CASCADE;

-- changeset PhamDuyHuy:1757194259868-1
ALTER TABLE rooms
    ALTER COLUMN room_type_id DROP NOT NULL;

