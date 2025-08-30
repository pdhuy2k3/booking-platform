-- liquibase formatted sql

-- changeset PhamDuyHuy:1756202554740-1
ALTER TABLE flights
    ADD aircraft_type VARCHAR(50);
ALTER TABLE flights
    ADD base_price DECIMAL(10, 2);
ALTER TABLE flights
    ADD status VARCHAR(20);

-- changeset PhamDuyHuy:1756202554740-3
ALTER TABLE flight_legs
    ADD created_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE flight_legs
    ADD created_by VARCHAR(255);
ALTER TABLE flight_legs
    ADD deleted_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE flight_legs
    ADD deleted_by VARCHAR(255);
ALTER TABLE flight_legs
    ADD is_deleted BOOLEAN;
ALTER TABLE flight_legs
    ADD updated_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE flight_legs
    ADD updated_by VARCHAR(255);

-- changeset PhamDuyHuy:1756202554740-4
UPDATE flight_legs
SET created_at = NOW(),
    is_deleted = FALSE,
    updated_at = NOW();

-- changeset PhamDuyHuy:1756202554740-5
ALTER TABLE flight_legs
    ALTER COLUMN created_at SET NOT NULL;

-- changeset PhamDuyHuy:1756202554740-9
ALTER TABLE flight_legs
    ALTER COLUMN is_deleted SET NOT NULL;

-- changeset PhamDuyHuy:1756202554740-12
ALTER TABLE flight_legs
    ALTER COLUMN updated_at SET NOT NULL;

