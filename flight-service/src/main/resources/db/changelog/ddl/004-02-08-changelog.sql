-- liquibase formatted sql

-- changeset PhamDuyHuy:1757194302776-1
CREATE TABLE flight_outbox_events
(
    id             UUID                        NOT NULL,
    aggregate_type VARCHAR(50)                 NOT NULL,
    aggregate_id   VARCHAR(100)                NOT NULL,
    event_type     VARCHAR(100)                NOT NULL,
    payload        TEXT,
    created_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT pk_flight_outbox_events PRIMARY KEY (id)
);

-- changeset PhamDuyHuy:1757194302776-2
ALTER TABLE flights
    ADD aircraft_type VARCHAR(50);
ALTER TABLE flights
    ADD base_price DECIMAL(10, 2);
ALTER TABLE flights
    ADD is_active BOOLEAN;
ALTER TABLE flights
    ADD status VARCHAR(20);

-- changeset PhamDuyHuy:1757194302776-4
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


-- changeset PhamDuyHuy:1757194302776-5
UPDATE flight_legs
SET created_at = NOW(), is_deleted = FALSE
WHERE 1=1;
ALTER TABLE flight_legs
    ALTER COLUMN created_at SET NOT NULL;

-- changeset PhamDuyHuy:1757194302776-9
ALTER TABLE airlines
    ADD is_active BOOLEAN;

-- changeset PhamDuyHuy:1757194302776-10
UPDATE airlines
SET is_active = TRUE
WHERE 1=1;

ALTER TABLE airlines
    ALTER COLUMN is_active SET NOT NULL;

-- changeset PhamDuyHuy:1757194302776-11
ALTER TABLE airports
    ADD is_active BOOLEAN;

-- changeset PhamDuyHuy:1757194302776-12
UPDATE airports
SET is_active = TRUE
WHERE 1=1;

ALTER TABLE airports
    ALTER COLUMN is_active SET NOT NULL;

-- changeset PhamDuyHuy:1757194302776-14
UPDATE flights
SET is_active = TRUE, status = 'SCHEDULED', base_price = 100.00, aircraft_type = 'Boeing 737'
WHERE 1=1;
ALTER TABLE flights
    ALTER COLUMN is_active SET NOT NULL;

-- changeset PhamDuyHuy:1757194302776-16
UPDATE flight_legs
SET created_by = 'system', updated_at = NOW(), updated_by = 'system', is_deleted = FALSE
WHERE 1=1;
ALTER TABLE flight_legs
    ALTER COLUMN is_deleted SET NOT NULL;

-- changeset PhamDuyHuy:1757194302776-19
ALTER TABLE flight_legs
    ALTER COLUMN updated_at SET NOT NULL;

-- changeset PhamDuyHuy:1757194302776-21
CREATE INDEX idx_flight_outbox_aggregate ON flight_outbox_events (aggregate_type, aggregate_id);

-- changeset PhamDuyHuy:1757194302776-22
CREATE INDEX idx_flight_outbox_created_at ON flight_outbox_events (created_at);

-- changeset PhamDuyHuy:1757194302776-23
CREATE INDEX idx_flight_outbox_event_type ON flight_outbox_events (event_type);

-- changeset PhamDuyHuy:1757194302776-24
ALTER TABLE airlines
    DROP COLUMN logo_url;

