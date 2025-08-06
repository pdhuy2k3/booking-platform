-- liquibase formatted sql

-- changeset PhamDuyHuy:1751920000000-1
-- comment: Add product details fields to bookings table using JSONB
ALTER TABLE bookings
ADD COLUMN product_details JSONB,
ADD COLUMN notes TEXT,
ADD COLUMN booking_source VARCHAR(50) DEFAULT 'BACKOFFICE';

-- changeset PhamDuyHuy:1751920000000-2
-- comment: Add GIN index on product_details for fast JSON queries
CREATE INDEX idx_bookings_product_details_gin ON bookings USING GIN (product_details);

-- changeset PhamDuyHuy:1751920000000-3
-- comment: Add functional indexes for common JSON queries
CREATE INDEX idx_bookings_flight_airline ON bookings ((product_details->>'airline'))
WHERE booking_type = 'FLIGHT';

CREATE INDEX idx_bookings_flight_number ON bookings ((product_details->>'flightNumber'))
WHERE booking_type = 'FLIGHT';

CREATE INDEX idx_bookings_hotel_city ON bookings ((product_details->>'city'))
WHERE booking_type = 'HOTEL';

CREATE INDEX idx_bookings_hotel_name ON bookings ((product_details->>'hotelName'))
WHERE booking_type = 'HOTEL';

-- changeset PhamDuyHuy:1751920000000-4
-- comment: Add indexes for performance
CREATE INDEX idx_bookings_booking_source ON bookings(booking_source);
CREATE INDEX idx_bookings_saga_state ON bookings(saga_state);
CREATE INDEX idx_bookings_booking_type ON bookings(booking_type);
