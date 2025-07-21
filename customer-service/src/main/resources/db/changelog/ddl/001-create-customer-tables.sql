--liquibase formatted sql

--changeset PhamDuyHuy:1751915157999-1
CREATE TABLE customer_profiles
(
    profile_id          UUID                        NOT NULL DEFAULT gen_random_uuid(),
    user_id             UUID                        NOT NULL UNIQUE, -- From Keycloak JWT
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          VARCHAR(255),
    updated_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(255),
    is_deleted          BOOLEAN                     NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMP WITHOUT TIME ZONE,
    deleted_by          VARCHAR(255),
    
    -- Extended profile information
    date_of_birth       DATE,
    nationality         VARCHAR(100),
    passport_number     VARCHAR(50),
    passport_expiry     DATE,
    passport_issuing_country VARCHAR(100),
    gender              VARCHAR(20),
    occupation          VARCHAR(100),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relationship VARCHAR(100),
    
    -- Preferences
    preferred_language  VARCHAR(10)                 NOT NULL DEFAULT 'en',
    preferred_currency  VARCHAR(3)                  NOT NULL DEFAULT 'VND',
    timezone           VARCHAR(50)                  NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    
    CONSTRAINT pk_customer_profiles PRIMARY KEY (profile_id)
);

--changeset PhamDuyHuy:1751915157999-2
CREATE TABLE customer_addresses
(
    address_id          UUID                        NOT NULL DEFAULT gen_random_uuid(),
    user_id             UUID                        NOT NULL, -- From Keycloak JWT
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          VARCHAR(255),
    updated_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(255),
    is_deleted          BOOLEAN                     NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMP WITHOUT TIME ZONE,
    deleted_by          VARCHAR(255),
    
    address_type        VARCHAR(50)                 NOT NULL, -- HOME, WORK, BILLING, SHIPPING
    is_default          BOOLEAN                     NOT NULL DEFAULT FALSE,
    
    -- Address details
    street_address      VARCHAR(500)                NOT NULL,
    apartment_unit      VARCHAR(100),
    city                VARCHAR(100)                NOT NULL,
    state_province      VARCHAR(100),
    postal_code         VARCHAR(20),
    country             VARCHAR(100)                NOT NULL,
    
    -- Additional fields for shipping
    recipient_name      VARCHAR(255),
    recipient_phone     VARCHAR(50),
    delivery_instructions TEXT,
    
    CONSTRAINT pk_customer_addresses PRIMARY KEY (address_id),
    CONSTRAINT fk_customer_addresses_profile FOREIGN KEY (user_id) REFERENCES customer_profiles (user_id)
);

--changeset PhamDuyHuy:1751915157999-3
CREATE TABLE customer_loyalty
(
    loyalty_id          UUID                        NOT NULL DEFAULT gen_random_uuid(),
    user_id             UUID                        NOT NULL UNIQUE, -- From Keycloak JWT
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          VARCHAR(255),
    updated_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(255),
    is_deleted          BOOLEAN                     NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMP WITHOUT TIME ZONE,
    deleted_by          VARCHAR(255),
    
    member_id           VARCHAR(50)                 NOT NULL UNIQUE,
    tier                VARCHAR(20)                 NOT NULL DEFAULT 'BRONZE', -- BRONZE, SILVER, GOLD, PLATINUM
    current_points      INTEGER                     NOT NULL DEFAULT 0,
    lifetime_points     INTEGER                     NOT NULL DEFAULT 0,
    points_expiry_date  DATE,
    
    -- Tier benefits
    tier_achieved_date  DATE,
    next_tier_points    INTEGER,
    tier_expiry_date    DATE,
    
    -- Status
    is_active           BOOLEAN                     NOT NULL DEFAULT TRUE,
    
    CONSTRAINT pk_customer_loyalty PRIMARY KEY (loyalty_id),
    CONSTRAINT fk_customer_loyalty_profile FOREIGN KEY (user_id) REFERENCES customer_profiles (user_id)
);

--changeset PhamDuyHuy:1751915157999-4
CREATE TABLE loyalty_transactions
(
    transaction_id      UUID                        NOT NULL DEFAULT gen_random_uuid(),
    user_id             UUID                        NOT NULL, -- From Keycloak JWT
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          VARCHAR(255),
    updated_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(255),
    is_deleted          BOOLEAN                     NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMP WITHOUT TIME ZONE,
    deleted_by          VARCHAR(255),
    
    transaction_type    VARCHAR(50)                 NOT NULL, -- EARNED, REDEEMED, EXPIRED, ADJUSTED
    points_amount       INTEGER                     NOT NULL,
    description         VARCHAR(500)                NOT NULL,
    reference_id        UUID, -- Booking ID, Order ID, etc.
    reference_type      VARCHAR(50), -- BOOKING, PURCHASE, MANUAL, etc.
    
    -- For redemptions
    redemption_value    DECIMAL(12, 2),
    redemption_currency VARCHAR(3),
    expiry_date         DATE,
    
    CONSTRAINT pk_loyalty_transactions PRIMARY KEY (transaction_id),
    CONSTRAINT fk_loyalty_transactions_profile FOREIGN KEY (user_id) REFERENCES customer_profiles (user_id)
);

--changeset PhamDuyHuy:1751915157999-5
CREATE TABLE customer_payment_methods
(
    payment_method_id   UUID                        NOT NULL DEFAULT gen_random_uuid(),
    user_id             UUID                        NOT NULL, -- From Keycloak JWT
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          VARCHAR(255),
    updated_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(255),
    is_deleted          BOOLEAN                     NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMP WITHOUT TIME ZONE,
    deleted_by          VARCHAR(255),
    
    payment_type        VARCHAR(50)                 NOT NULL, -- CREDIT_CARD, DEBIT_CARD, BANK_ACCOUNT, DIGITAL_WALLET
    is_default          BOOLEAN                     NOT NULL DEFAULT FALSE,
    is_verified         BOOLEAN                     NOT NULL DEFAULT FALSE,
    
    -- Card details (encrypted/tokenized)
    card_last_four      VARCHAR(4),
    card_brand          VARCHAR(50), -- VISA, MASTERCARD, AMEX, etc.
    card_expiry_month   INTEGER,
    card_expiry_year    INTEGER,
    cardholder_name     VARCHAR(255),
    
    -- Bank account details (encrypted/tokenized)
    bank_name           VARCHAR(255),
    account_last_four   VARCHAR(4),
    account_type        VARCHAR(50), -- CHECKING, SAVINGS
    
    -- Digital wallet details
    wallet_provider     VARCHAR(100), -- PAYPAL, APPLE_PAY, GOOGLE_PAY, etc.
    wallet_email        VARCHAR(255),
    
    -- External provider tokens (encrypted)
    provider_token      TEXT, -- Encrypted payment provider token
    provider_customer_id VARCHAR(255), -- External payment provider customer ID
    
    CONSTRAINT pk_customer_payment_methods PRIMARY KEY (payment_method_id),
    CONSTRAINT fk_customer_payment_methods_profile FOREIGN KEY (user_id) REFERENCES customer_profiles (user_id)
);

--changeset PhamDuyHuy:1751915157999-6
CREATE TABLE customer_travel_documents
(
    document_id         UUID                        NOT NULL DEFAULT gen_random_uuid(),
    user_id             UUID                        NOT NULL, -- From Keycloak JWT
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          VARCHAR(255),
    updated_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(255),
    is_deleted          BOOLEAN                     NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMP WITHOUT TIME ZONE,
    deleted_by          VARCHAR(255),
    
    document_type       VARCHAR(50)                 NOT NULL, -- PASSPORT, NATIONAL_ID, DRIVER_LICENSE, VISA
    document_number     VARCHAR(100)                NOT NULL,
    issuing_country     VARCHAR(100)                NOT NULL,
    issuing_authority   VARCHAR(255),
    issue_date          DATE,
    expiry_date         DATE,
    
    -- Document holder details
    holder_first_name   VARCHAR(255)                NOT NULL,
    holder_last_name    VARCHAR(255)                NOT NULL,
    holder_date_of_birth DATE,
    holder_nationality  VARCHAR(100),
    holder_gender       VARCHAR(20),
    
    -- Verification status
    is_verified         BOOLEAN                     NOT NULL DEFAULT FALSE,
    verified_at         TIMESTAMP WITHOUT TIME ZONE,
    verified_by         VARCHAR(255),
    verification_notes  TEXT,
    
    -- File storage
    document_file_url   VARCHAR(1000), -- URL to stored document image/PDF
    document_file_name  VARCHAR(255),
    
    CONSTRAINT pk_customer_travel_documents PRIMARY KEY (document_id),
    CONSTRAINT fk_customer_travel_documents_profile FOREIGN KEY (user_id) REFERENCES customer_profiles (user_id)
);

--changeset PhamDuyHuy:1751915157999-7
CREATE TABLE customer_saved_travelers
(
    traveler_id         UUID                        NOT NULL DEFAULT gen_random_uuid(),
    user_id             UUID                        NOT NULL, -- From Keycloak JWT
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          VARCHAR(255),
    updated_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(255),
    is_deleted          BOOLEAN                     NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMP WITHOUT TIME ZONE,
    deleted_by          VARCHAR(255),
    
    -- Traveler details
    first_name          VARCHAR(255)                NOT NULL,
    last_name           VARCHAR(255)                NOT NULL,
    date_of_birth       DATE,
    nationality         VARCHAR(100),
    gender              VARCHAR(20),
    
    -- Travel document reference
    passport_number     VARCHAR(100),
    passport_expiry     DATE,
    passport_issuing_country VARCHAR(100),
    
    -- Relationship to account holder
    relationship        VARCHAR(100), -- SELF, SPOUSE, CHILD, PARENT, FRIEND, etc.
    
    -- Contact information
    email               VARCHAR(255),
    phone               VARCHAR(50),
    
    -- Special requirements
    special_assistance  TEXT,
    dietary_requirements TEXT,
    seat_preference     VARCHAR(100),
    
    CONSTRAINT pk_customer_saved_travelers PRIMARY KEY (traveler_id),
    CONSTRAINT fk_customer_saved_travelers_profile FOREIGN KEY (user_id) REFERENCES customer_profiles (user_id)
);

--changeset PhamDuyHuy:1751915157999-8
CREATE TABLE customer_notification_preferences
(
    preference_id       UUID                        NOT NULL DEFAULT gen_random_uuid(),
    user_id             UUID                        NOT NULL UNIQUE, -- From Keycloak JWT
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          VARCHAR(255),
    updated_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(255),
    is_deleted          BOOLEAN                     NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMP WITHOUT TIME ZONE,
    deleted_by          VARCHAR(255),
    
    -- Notification channels
    email_enabled       BOOLEAN                     NOT NULL DEFAULT TRUE,
    sms_enabled         BOOLEAN                     NOT NULL DEFAULT FALSE,
    push_enabled        BOOLEAN                     NOT NULL DEFAULT TRUE,
    
    -- Notification types
    booking_updates     BOOLEAN                     NOT NULL DEFAULT TRUE,
    payment_confirmations BOOLEAN                   NOT NULL DEFAULT TRUE,
    promotional_offers  BOOLEAN                     NOT NULL DEFAULT FALSE,
    newsletter          BOOLEAN                     NOT NULL DEFAULT FALSE,
    loyalty_updates     BOOLEAN                     NOT NULL DEFAULT TRUE,
    security_alerts     BOOLEAN                     NOT NULL DEFAULT TRUE,
    
    -- Marketing preferences
    marketing_consent   BOOLEAN                     NOT NULL DEFAULT FALSE,
    marketing_consent_date TIMESTAMP WITHOUT TIME ZONE,
    
    CONSTRAINT pk_customer_notification_preferences PRIMARY KEY (preference_id),
    CONSTRAINT fk_customer_notification_preferences_profile FOREIGN KEY (user_id) REFERENCES customer_profiles (user_id)
);

--changeset PhamDuyHuy:1751915157999-9
-- Create indexes for performance
CREATE INDEX idx_customer_profiles_user_id ON customer_profiles (user_id);
CREATE INDEX idx_customer_addresses_user_id ON customer_addresses (user_id);
CREATE INDEX idx_customer_addresses_type ON customer_addresses (address_type);
CREATE INDEX idx_customer_addresses_default ON customer_addresses (user_id, is_default) WHERE is_default = TRUE;
CREATE INDEX idx_customer_loyalty_user_id ON customer_loyalty (user_id);
CREATE INDEX idx_customer_loyalty_member_id ON customer_loyalty (member_id);
CREATE INDEX idx_loyalty_transactions_user_id ON loyalty_transactions (user_id);
CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions (transaction_type);
CREATE INDEX idx_loyalty_transactions_reference ON loyalty_transactions (reference_id, reference_type);
CREATE INDEX idx_customer_payment_methods_user_id ON customer_payment_methods (user_id);
CREATE INDEX idx_customer_payment_methods_default ON customer_payment_methods (user_id, is_default) WHERE is_default = TRUE;
CREATE INDEX idx_customer_travel_documents_user_id ON customer_travel_documents (user_id);
CREATE INDEX idx_customer_travel_documents_type ON customer_travel_documents (document_type);
CREATE INDEX idx_customer_saved_travelers_user_id ON customer_saved_travelers (user_id);
CREATE INDEX idx_customer_notification_preferences_user_id ON customer_notification_preferences (user_id);

--changeset PhamDuyHuy:1751915157999-10
-- Create outbox table for customer events
CREATE TABLE customer_outbox_events
(
    event_id            UUID                        NOT NULL DEFAULT gen_random_uuid(),
    aggregate_type      VARCHAR(255)                NOT NULL,
    aggregate_id        VARCHAR(255)                NOT NULL,
    event_type          VARCHAR(255)                NOT NULL,
    event_data          JSONB                       NOT NULL,
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed           BOOLEAN                     NOT NULL DEFAULT FALSE,
    processed_at        TIMESTAMP WITHOUT TIME ZONE,
    
    -- Self-processing tracking for "Listen To Yourself" pattern
    self_processed      BOOLEAN                     NOT NULL DEFAULT FALSE,
    self_processed_at   TIMESTAMP WITHOUT TIME ZONE,
    processing_attempts INTEGER                     NOT NULL DEFAULT 0,
    
    CONSTRAINT pk_customer_outbox_events PRIMARY KEY (event_id)
);

CREATE INDEX idx_customer_outbox_events_processed ON customer_outbox_events (processed);
CREATE INDEX idx_customer_outbox_events_self_processed ON customer_outbox_events (self_processed);
CREATE INDEX idx_customer_outbox_events_aggregate ON customer_outbox_events (aggregate_type, aggregate_id);
CREATE INDEX idx_customer_outbox_events_created_at ON customer_outbox_events (created_at);
