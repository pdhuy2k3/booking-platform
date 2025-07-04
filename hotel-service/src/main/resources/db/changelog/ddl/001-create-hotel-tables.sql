-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create amenity_category_enum type
CREATE TYPE amenity_category_enum AS ENUM (
    'INTERNET_CONNECTIVITY',
    'ENTERTAINMENT',
    'COMFORT',
    'BATHROOM',
    'FOOD_BEVERAGE',
    'BUSINESS',
    'SAFETY_SECURITY',
    'ACCESSIBILITY',
    'PARKING',
    'RECREATION',
    'SERVICES',
    'KITCHEN',
    'OTHER'
);

-- Cities table
CREATE TABLE cities (
    city_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL
);

-- Hotels table
CREATE TABLE hotels (
    hotel_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city_id INTEGER NOT NULL REFERENCES cities(city_id),
    star_rating SMALLINT CHECK (star_rating BETWEEN 1 AND 5),
    description TEXT,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    checkin_time TIME,
    checkout_time TIME
);

-- RoomTypes table
CREATE TABLE room_types (
    room_type_id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES hotels(hotel_id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    capacity_adults SMALLINT NOT NULL,
    capacity_children SMALLINT NOT NULL DEFAULT 0,
    base_price DECIMAL(12, 2) NOT NULL
);

-- Rooms table
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES hotels(hotel_id),
    room_number VARCHAR(255) NOT NULL,
    room_type VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    max_occupancy INTEGER,
    bed_type VARCHAR(255),
    room_size INTEGER,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Amenities table
CREATE TABLE amenities (
    amenity_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category amenity_category_enum,
    icon_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER
);

-- Hotel_Amenities table
CREATE TABLE hotel_amenities (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES hotels(hotel_id),
    amenity_id INTEGER NOT NULL REFERENCES amenities(amenity_id)
);

-- Room_Amenities table
CREATE TABLE room_amenities (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id),
    amenity_id INTEGER NOT NULL REFERENCES amenities(amenity_id),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Room_Images table
CREATE TABLE room_images (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id),
    image_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Room_Availability table
CREATE TABLE room_availability (
    availability_id SERIAL PRIMARY KEY,
    room_type_id INTEGER NOT NULL REFERENCES room_types(room_type_id),
    date DATE NOT NULL,
    total_inventory SMALLINT NOT NULL,
    total_reserved SMALLINT NOT NULL DEFAULT 0,
    price_override DECIMAL(12, 2),
    UNIQUE (room_type_id, date)
);

-- Reviews table
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES hotels(hotel_id),
    user_id UUID, -- References Users in UserService
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hotel_Photos table
CREATE TABLE hotel_photos (
    photo_id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES hotels(hotel_id),
    url VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE
);

-- Hotel_Images table
CREATE TABLE hotel_images (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER NOT NULL REFERENCES hotels(hotel_id),
    image_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
