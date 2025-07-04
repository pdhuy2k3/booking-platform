-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create transport service enums
CREATE TYPE vehicle_type_enum AS ENUM ('BUS', 'TRAIN');

-- Operators table
CREATE TABLE operators (
    operator_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Routes table
CREATE TABLE routes (
    route_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    operator_id INTEGER NOT NULL REFERENCES operators(operator_id)
);

-- Stops table
CREATE TABLE stops (
    stop_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255)
);

-- Route_Stops table
CREATE TABLE route_stops (
    route_id INTEGER NOT NULL REFERENCES routes(route_id),
    stop_id INTEGER NOT NULL REFERENCES stops(stop_id),
    stop_order SMALLINT NOT NULL,
    travel_time_from_previous_mins INTEGER,
    PRIMARY KEY (route_id, stop_id),
    UNIQUE (route_id, stop_order)
);

-- Route_Fares table
CREATE TABLE route_fares (
    fare_id SERIAL PRIMARY KEY,
    route_id INTEGER NOT NULL REFERENCES routes(route_id),
    origin_stop_id INTEGER NOT NULL REFERENCES stops(stop_id),
    destination_stop_id INTEGER NOT NULL REFERENCES stops(stop_id),
    price DECIMAL(10, 2) NOT NULL
);

-- Seat_Layouts table
CREATE TABLE seat_layouts (
    layout_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    layout_data JSONB NOT NULL
);
);

-- Vehicles table
CREATE TABLE vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) UNIQUE,
    type vehicle_type_enum NOT NULL,
    layout_id INTEGER NOT NULL REFERENCES seat_layouts(layout_id)
);

-- Seats table
CREATE TABLE seats (
    seat_id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(vehicle_id),
    seat_number VARCHAR(5) NOT NULL,
    UNIQUE (vehicle_id, seat_number)
);

-- Trips table
CREATE TABLE trips (
    trip_id SERIAL PRIMARY KEY,
    route_id INTEGER NOT NULL REFERENCES routes(route_id),
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(vehicle_id),
    departure_datetime TIMESTAMPTZ NOT NULL
);

-- Seat_Reservations_By_Leg table
CREATE TABLE seat_reservations_by_leg (
    reservation_id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(trip_id),
    seat_id INTEGER NOT NULL REFERENCES seats(seat_id),
    booking_item_id UUID NOT NULL, -- References Booking_Items in BookingService
    departure_stop_id INTEGER NOT NULL REFERENCES stops(stop_id),
    arrival_stop_id INTEGER NOT NULL REFERENCES stops(stop_id),
    UNIQUE (trip_id, seat_id, departure_stop_id)
);
