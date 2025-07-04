-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create booking status enums
CREATE TYPE booking_status_enum AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED');
CREATE TYPE booking_type_enum AS ENUM ('FLIGHT', 'HOTEL', 'BUS', 'TRAIN', 'COMBO');
CREATE TYPE service_type_enum AS ENUM ('FLIGHT', 'HOTEL', 'BUS', 'TRAIN');
CREATE TYPE saga_status_enum AS ENUM ('STARTED', 'PROCESSING_FLIGHT', 'PROCESSING_HOTEL', 'AWAITING_PAYMENT', 'COMPENSATING_FLIGHT', 'COMPLETED', 'FAILED');
CREATE TYPE saga_step_status_enum AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'COMPENSATED');

-- Bookings table
CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference VARCHAR(20) NOT NULL UNIQUE,
    user_id UUID NOT NULL, -- References Users in UserService
    total_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    status booking_status_enum NOT NULL,
    booking_type booking_type_enum NOT NULL,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_on TIMESTAMPTZ,
    created_by VARCHAR(255),
    last_modified_on TIMESTAMPTZ,
    last_modified_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Booking_Items table
CREATE TABLE booking_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id),
    service_type service_type_enum NOT NULL,
    provider_booking_ref VARCHAR(255),
    status VARCHAR(50),
    price DECIMAL(12, 2) NOT NULL,
    details JSONB,
    created_on TIMESTAMPTZ,
    created_by VARCHAR(255),
    last_modified_on TIMESTAMPTZ,
    last_modified_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Sagas table
CREATE TABLE sagas (
    saga_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(booking_id),
    saga_type VARCHAR(100) NOT NULL,
    status saga_status_enum NOT NULL,
    payload JSONB,
    created_on TIMESTAMPTZ,
    created_by VARCHAR(255),
    last_modified_on TIMESTAMPTZ,
    last_modified_by VARCHAR(255),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Saga_Steps table
CREATE TABLE saga_steps (
    step_id SERIAL PRIMARY KEY,
    saga_id UUID NOT NULL REFERENCES sagas(saga_id),
    step_name VARCHAR(100) NOT NULL,
    status saga_step_status_enum NOT NULL,
    request_payload JSONB,
    response_payload JSONB,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ
);
