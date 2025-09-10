-- liquibase formatted sql

-- changeset PhamDuyHuy:1757360479719-7
ALTER TABLE media
    DROP COLUMN alt_text;
ALTER TABLE media
    DROP COLUMN asset_id;
ALTER TABLE media
    DROP COLUMN entity_id;
ALTER TABLE media
    DROP COLUMN entity_type;
ALTER TABLE media
    DROP COLUMN file_size;
ALTER TABLE media
    DROP COLUMN folder;
ALTER TABLE media
    DROP COLUMN format;
ALTER TABLE media
    DROP COLUMN height;
ALTER TABLE media
    DROP COLUMN metadata;
ALTER TABLE media
    DROP COLUMN original_filename;
ALTER TABLE media
    DROP COLUMN resource_type;
ALTER TABLE media
    DROP COLUMN tags;
ALTER TABLE media
    DROP COLUMN version;
ALTER TABLE media
    DROP COLUMN width;

-- changeset PhamDuyHuy:1757360479719-1
ALTER TABLE media
    ALTER COLUMN media_type TYPE VARCHAR(20) USING (media_type::VARCHAR(20));

