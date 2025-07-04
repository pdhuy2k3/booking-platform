
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customer service enums
CREATE TYPE system_role_enum AS ENUM ('TRAVELLER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE group_role_enum AS ENUM ('ADMIN', 'TRAVELLER');

-- Authentication data is managed by Logto
CREATE TABLE customers (
    customer_id UUID PRIMARY KEY, -- This will be the Logto user ID
    logto_sub_id VARCHAR(255) NOT NULL UNIQUE, -- Logto's subject identifier
    system_role system_role_enum NOT NULL DEFAULT 'TRAVELLER',
    preferred_language VARCHAR(10) DEFAULT 'vi',
    preferred_currency VARCHAR(3) DEFAULT 'VND',
    phone_number VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    travel_preferences JSONB, -- JSON for flexible preferences like seat preference, meal preference, etc.
    loyalty_points INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer_Groups table
CREATE TABLE customer_groups (
    group_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES customers(customer_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer_Group_Memberships table
CREATE TABLE customer_group_memberships (
    membership_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(customer_id),
    group_id UUID REFERENCES customer_groups(group_id),
    role_in_group group_role_enum NOT NULL DEFAULT 'TRAVELLER',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id, group_id)
);
