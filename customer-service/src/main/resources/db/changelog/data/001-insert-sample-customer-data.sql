-- Sample Customers data
-- Note: In real scenario, these would be created when users first login via Logto
INSERT INTO Customers (customer_id, logto_sub_id, system_role, preferred_language, preferred_currency, phone_number, emergency_contact_name, emergency_contact_phone, travel_preferences, loyalty_points, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'logto_admin_001', 'SUPER_ADMIN', 'vi', 'VND', '+84901234567', 'Admin Emergency', '+84907654321', '{"seat_preference": "aisle", "meal_preference": "vegetarian"}', 1000, TRUE, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'logto_user_001', 'TRAVELLER', 'vi', 'VND', '+84912345678', 'Jane Doe', '+84987654321', '{"seat_preference": "window", "meal_preference": "standard", "airline_preference": "VN"}', 500, TRUE, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'logto_user_002', 'TRAVELLER', 'en', 'VND', '+84923456789', 'John Smith', '+84976543210', '{"seat_preference": "aisle", "meal_preference": "halal", "hotel_preference": "5_star"}', 250, TRUE, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'logto_agent_001', 'ADMIN', 'vi', 'VND', '+84934567890', 'Agent Support', '+84965432109', '{"notification_preference": "email", "working_hours": "9-17"}', 0, TRUE, NOW(), NOW());

-- Sample Customer_Groups data
INSERT INTO Customer_Groups (group_id, group_name, created_by) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Family Trip to Da Nang', '550e8400-e29b-41d4-a716-446655440002'),
('650e8400-e29b-41d4-a716-446655440002', 'Business Travel Team', '550e8400-e29b-41d4-a716-446655440004'),
('650e8400-e29b-41d4-a716-446655440003', 'University Friends', '550e8400-e29b-41d4-a716-446655440003');

-- Sample Customer_Group_Memberships data
INSERT INTO Customer_Group_Memberships (customer_id, group_id, role_in_group) VALUES
-- John's family group
('550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'ADMIN'),
 
-- Jane joins John's family group
('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'TRAVELLER'),

-- Agent's business group
('550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440002', 'ADMIN'),

-- Jane's university group
('550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'ADMIN');
