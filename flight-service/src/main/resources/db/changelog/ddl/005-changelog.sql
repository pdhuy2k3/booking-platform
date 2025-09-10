-- liquibase formatted sql

-- changeset PhamDuyHuy:1757357173749-19
ALTER TABLE flight_inventory
    DROP CONSTRAINT fk_flight_inventory_on_flight_leg;

-- changeset PhamDuyHuy:1757357173749-20
ALTER TABLE flight_legs
    DROP CONSTRAINT fk_flight_legs_on_arrival_airport;

-- changeset PhamDuyHuy:1757357173749-21
ALTER TABLE flight_legs
    DROP CONSTRAINT fk_flight_legs_on_departure_airport;

-- changeset PhamDuyHuy:1757357173749-22
ALTER TABLE flight_legs
    DROP CONSTRAINT fk_flight_legs_on_flight;

-- changeset PhamDuyHuy:1757359532976-2
ALTER TABLE airlines ADD featured_media_id BIGINT;

-- changeset PhamDuyHuy:1757359532976-3
ALTER TABLE airports ADD featured_media_id BIGINT;
ALTER TABLE airports ADD latitude DOUBLE PRECISION;
ALTER TABLE airports ADD longitude DOUBLE PRECISION;

-- changeset PhamDuyHuy:1757359532976-8
DROP TABLE flight_inventory CASCADE;

-- changeset PhamDuyHuy:1757359532976-9
DROP TABLE flight_legs CASCADE;

-- changeset PhamDuyHuy:1757359532976-1
ALTER TABLE flight_fares ALTER COLUMN fare_class TYPE VARCHAR(255) USING (fare_class::VARCHAR(255));

