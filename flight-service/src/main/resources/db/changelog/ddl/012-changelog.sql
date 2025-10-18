-- liquibase formatted sql

-- changeset PhamDuyHuy:1760261982718-1
ALTER TABLE aircraft
    ADD featured_media_url VARCHAR(500);

-- changeset PhamDuyHuy:1760261982718-2
ALTER TABLE airlines
    ADD featured_media_url VARCHAR(500);

-- changeset PhamDuyHuy:1760261982718-3
ALTER TABLE airports
    ADD featured_media_url VARCHAR(500);

-- changeset PhamDuyHuy:1760261982718-4
ALTER TABLE flights
    ADD featured_media_url VARCHAR(500);

-- changeset PhamDuyHuy:1760261982718-10
ALTER TABLE aircraft DROP COLUMN featured_media_id;

-- changeset PhamDuyHuy:1760261982718-11
ALTER TABLE airlines DROP COLUMN featured_media_id;

-- changeset PhamDuyHuy:1760261982718-12
ALTER TABLE airports DROP COLUMN featured_media_id;

