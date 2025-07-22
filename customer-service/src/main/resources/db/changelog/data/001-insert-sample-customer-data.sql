--liquibase formatted sql

--changeset PhamDuyHuy:1751915157999-11
-- Sample customer profiles (using sample UUIDs that would come from Keycloak)
INSERT INTO customer_profiles (
    user_id, date_of_birth, nationality, passport_number, passport_expiry, passport_issuing_country,
    gender, occupation, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
    preferred_language, preferred_currency, timezone
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001', -- Sample Keycloak user ID
    '1990-05-15', 'Vietnamese', 'N1234567', '2030-05-15', 'Vietnam',
    'Male', 'Software Engineer', 'Nguyen Van A', '+84901234567', 'Father',
    'vi', 'VND', 'Asia/Ho_Chi_Minh'
),
(
    '550e8400-e29b-41d4-a716-446655440002', -- Sample Keycloak user ID
    '1985-08-22', 'Vietnamese', 'N2345678', '2028-08-22', 'Vietnam',
    'Female', 'Marketing Manager', 'Tran Thi B', '+84901234568', 'Mother',
    'en', 'USD', 'Asia/Ho_Chi_Minh'
);

--changeset PhamDuyHuy:1751915157999-12
-- Sample customer addresses
INSERT INTO customer_addresses (
    user_id, address_type, is_default, street_address, city, state_province, postal_code, country,
    recipient_name, recipient_phone
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001', 'HOME', TRUE,
    '123 Nguyen Hue Street, District 1', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'Vietnam',
    'Pham Duy Huy', '+84901234567'
),
(
    '550e8400-e29b-41d4-a716-446655440001', 'WORK', FALSE,
    '456 Le Loi Street, District 3', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'Vietnam',
    'Pham Duy Huy', '+84901234567'
),
(
    '550e8400-e29b-41d4-a716-446655440002', 'HOME', TRUE,
    '789 Tran Hung Dao Street, District 5', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'Vietnam',
    'Nguyen Thi C', '+84901234568'
);

--changeset PhamDuyHuy:1751915157999-13
-- Sample loyalty programs
INSERT INTO customer_loyalty (
    user_id, member_id, tier, current_points, lifetime_points, points_expiry_date,
    tier_achieved_date, next_tier_points, tier_expiry_date, is_active
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001', 'BS001234567', 'SILVER', 2500, 15000, '2025-12-31',
    '2024-06-15', 2500, '2025-06-15', TRUE
),
(
    '550e8400-e29b-41d4-a716-446655440002', 'BS001234568', 'GOLD', 5200, 28000, '2025-12-31',
    '2024-03-20', 4800, '2025-03-20', TRUE
);

--changeset PhamDuyHuy:1751915157999-14
-- Sample loyalty transactions
INSERT INTO loyalty_transactions (
    user_id, transaction_type, points_amount, description, reference_type
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001', 'EARNED', 500, 'Points earned from flight booking', 'BOOKING'
),
(
    '550e8400-e29b-41d4-a716-446655440001', 'EARNED', 300, 'Points earned from hotel booking', 'BOOKING'
),
(
    '550e8400-e29b-41d4-a716-446655440001', 'REDEEMED', -200, 'Points redeemed for discount', 'REDEMPTION'
),
(
    '550e8400-e29b-41d4-a716-446655440002', 'EARNED', 800, 'Points earned from premium booking', 'BOOKING'
),
(
    '550e8400-e29b-41d4-a716-446655440002', 'EARNED', 1000, 'Bonus points for tier upgrade', 'MANUAL'
);

--changeset PhamDuyHuy:1751915157999-15
-- Sample notification preferences
INSERT INTO customer_notification_preferences (
    user_id, email_enabled, sms_enabled, push_enabled, booking_updates, payment_confirmations,
    promotional_offers, newsletter, loyalty_updates, security_alerts, marketing_consent, marketing_consent_date
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001', TRUE, FALSE, TRUE, TRUE, TRUE,
    FALSE, FALSE, TRUE, TRUE, FALSE, NULL
),
(
    '550e8400-e29b-41d4-a716-446655440002', TRUE, TRUE, TRUE, TRUE, TRUE,
    TRUE, TRUE, TRUE, TRUE, TRUE, CURRENT_TIMESTAMP
);

--changeset PhamDuyHuy:1751915157999-16
-- Sample saved travelers
INSERT INTO customer_saved_travelers (
    user_id, first_name, last_name, date_of_birth, nationality, gender,
    passport_number, passport_expiry, passport_issuing_country, relationship,
    email, phone, special_assistance, dietary_requirements
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001', 'Pham', 'Duy Huy', '1990-05-15', 'Vietnamese', 'Male',
    'N1234567', '2030-05-15', 'Vietnam', 'SELF',
    'huypd.dev@gmail.com', '+84901234567', NULL, 'Vegetarian'
),
(
    '550e8400-e29b-41d4-a716-446655440001', 'Nguyen', 'Thi D', '1992-03-10', 'Vietnamese', 'Female',
    'N3456789', '2029-03-10', 'Vietnam', 'SPOUSE',
    'spouse@example.com', '+84901234569', NULL, NULL
),
(
    '550e8400-e29b-41d4-a716-446655440002', 'Nguyen', 'Thi C', '1985-08-22', 'Vietnamese', 'Female',
    'N2345678', '2028-08-22', 'Vietnam', 'SELF',
    'customer2@example.com', '+84901234568', 'Wheelchair assistance', 'Gluten-free'
);
