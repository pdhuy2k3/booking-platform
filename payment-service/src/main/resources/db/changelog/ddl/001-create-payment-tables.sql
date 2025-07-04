-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create payment service enums
CREATE TYPE transaction_status_enum AS ENUM ('INITIATED', 'PENDING_GATEWAY', 'SUCCESS', 'FAILED', 'REFUNDED', 'REFUND_FAILED');
CREATE TYPE refund_status_enum AS ENUM ('REQUESTED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- Payment_Methods table
CREATE TABLE payment_methods (
    payment_method_id SERIAL PRIMARY KEY,
    provider_name VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Transactions table
CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL UNIQUE, -- References Bookings in BookingService
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    status transaction_status_enum NOT NULL,
    payment_method_id INTEGER NOT NULL REFERENCES payment_methods(payment_method_id),
    gateway_transaction_id VARCHAR(255),
    gateway_response_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Refunds table
CREATE TABLE refunds (
    refund_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_transaction_id UUID NOT NULL REFERENCES transactions(transaction_id),
    amount DECIMAL(12, 2) NOT NULL,
    reason TEXT,
    status refund_status_enum NOT NULL,
    gateway_refund_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
