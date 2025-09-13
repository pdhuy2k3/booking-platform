-- liquibase formatted sql

-- changeset PhamDuyHuy:1757642337883-1
ALTER TABLE flight_schedules
    ADD aircraft_id BIGINT;

-- changeset PhamDuyHuy:1757642337883-2
ALTER TABLE flight_schedules
    ADD CONSTRAINT FK_FLIGHT_SCHEDULES_ON_AIRCRAFT FOREIGN KEY (aircraft_id) REFERENCES aircraft (aircraft_id);

