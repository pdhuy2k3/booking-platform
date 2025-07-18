-- liquibase formatted sql

-- changeset PhamDuyHuy:1752763925412-2
ALTER TABLE rooms
    DROP COLUMN room_type;

-- changeset PhamDuyHuy:1752763925412-1
ALTER TABLE room_types
    ALTER COLUMN hotel_id DROP NOT NULL;

