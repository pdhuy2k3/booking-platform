-- liquibase formatted sql

-- changeset pdhuy2k3:001-create-flight-enums
CREATE TYPE fare_type_enum AS ENUM ('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST');

-- changeset pdhuy2k3:001-create-flight-tables
-- Bảng Airlines: Hãng hàng không
CREATE TABLE airlines (
                          id UUID PRIMARY KEY,
                          name VARCHAR(255),
                          iata_code VARCHAR(3),
                          created_on TIMESTAMPTZ,
                          created_by VARCHAR(255),
                          last_modified_on TIMESTAMPTZ,
                          last_modified_by VARCHAR(255),
                          deleted BOOLEAN DEFAULT FALSE,
                          is_active BOOLEAN DEFAULT TRUE
);

-- Bảng Airports: Sân bay
CREATE TABLE airports (
                          id UUID PRIMARY KEY,
                          name VARCHAR(255),
                          iata_code VARCHAR(3) UNIQUE,
                          city VARCHAR(255),
                          country VARCHAR(255)
);

-- Bảng Flights: Chuyến bay
CREATE TABLE flights (
                         id UUID PRIMARY KEY,
                         flight_number VARCHAR(20),
                         airline_id UUID NOT NULL REFERENCES airlines(id),
                         departure_airport_id UUID NOT NULL REFERENCES airports(id),
                         arrival_airport_id UUID NOT NULL REFERENCES airports(id),
                         departure_time TIMESTAMPTZ,
                         arrival_time TIMESTAMPTZ,
                         duration_minutes INT,
                         created_on TIMESTAMPTZ,
                         created_by VARCHAR(255),
                         last_modified_on TIMESTAMPTZ,
                         last_modified_by VARCHAR(255),
                         deleted BOOLEAN DEFAULT FALSE,
                         is_active BOOLEAN DEFAULT TRUE
);

-- Bảng Flight Fares: Các hạng giá vé cho mỗi chuyến bay
CREATE TABLE flight_fares (
                              id UUID PRIMARY KEY,
                              flight_id UUID NOT NULL REFERENCES flights(id),
                              fare_type fare_type_enum,
                              price DECIMAL(19, 2),
                              available_seats INT
);

