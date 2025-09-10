-- liquibase formatted sql

-- changeset PhamDuyHuy:1757457987044-1
ALTER TABLE hotel_images
    ADD is_primary BOOLEAN;
ALTER TABLE hotel_images
    ADD public_id VARCHAR(255);
ALTER TABLE hotel_images
    ADD url VARCHAR(255);

-- changeset PhamDuyHuy:1757457987044-2
ALTER TABLE hotel_images
    ALTER COLUMN is_primary SET NOT NULL;

-- changeset PhamDuyHuy:1757457987044-3
ALTER TABLE room_images
    ADD is_primary BOOLEAN;
ALTER TABLE room_images
    ADD public_id VARCHAR(255);
ALTER TABLE room_images
    ADD url VARCHAR(255);

-- changeset PhamDuyHuy:1757457987044-4
ALTER TABLE room_images
    ALTER COLUMN is_primary SET NOT NULL;

-- changeset PhamDuyHuy:1757457987044-5
ALTER TABLE room_type_images
    ADD is_primary BOOLEAN;
ALTER TABLE room_type_images
    ADD public_id VARCHAR(255);
ALTER TABLE room_type_images
    ADD url VARCHAR(255);

-- changeset PhamDuyHuy:1757457987044-6
ALTER TABLE room_type_images
    ALTER COLUMN is_primary SET NOT NULL;

