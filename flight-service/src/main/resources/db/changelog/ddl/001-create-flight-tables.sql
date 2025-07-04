-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create fare_class_enum type
CREATE TYPE fare_class_enum AS ENUM ('ECONOMY', 'BUSINESS', 'FIRST');

-- Airlines table
CREATE TABLE airlines (
    airline_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    iata_code VARCHAR(2) NOT NULL UNIQUE,
    logo_url VARCHAR(255),
    created_on TIMESTAMPTZ,
    created_by VARCHAR(255),
    last_modified_on TIMESTAMPTZ,
    last_modified_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Airports table
CREATE TABLE airports (
    airport_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    iata_code VARCHAR(3) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL
);

-- Flights table
CREATE TABLE flights (
    flight_id SERIAL PRIMARY KEY,
    flight_number VARCHAR(10) NOT NULL,
    airline_id INTEGER NOT NULL REFERENCES airlines(airline_id),
    aircraft_type VARCHAR(50),
    created_on TIMESTAMPTZ,
    created_by VARCHAR(255),
    last_modified_on TIMESTAMPTZ,
    last_modified_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Flight_Legs table
CREATE TABLE flight_legs (
    leg_id SERIAL PRIMARY KEY,
    flight_id INTEGER NOT NULL REFERENCES flights(flight_id),
    leg_number SMALLINT NOT NULL,
    departure_airport_id INTEGER NOT NULL REFERENCES airports(airport_id),
    arrival_airport_id INTEGER NOT NULL REFERENCES airports(airport_id),
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    UNIQUE (flight_id, leg_number)
);

-- FlightFares table
CREATE TABLE flight_fares (
    fare_id SERIAL PRIMARY KEY,
    flight_id INTEGER NOT NULL REFERENCES flights(flight_id),
    fare_class fare_class_enum NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    conditions TEXT,
    UNIQUE (flight_id, fare_class)
);

-- Flight_Inventory table
CREATE TABLE flight_inventory (
    inventory_id SERIAL PRIMARY KEY,
    flight_leg_id INTEGER NOT NULL REFERENCES flight_legs(leg_id),
    fare_class fare_class_enum NOT NULL,
    total_seats SMALLINT NOT NULL,
    reserved_seats SMALLINT NOT NULL DEFAULT 0,
    UNIQUE (flight_leg_id, fare_class)
);
