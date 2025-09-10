-- liquibase formatted sql

-- changeset PhamDuyHuy:1757426207281-2
ALTER TABLE media
    DROP COLUMN display_order;
ALTER TABLE media
    DROP COLUMN is_primary;

