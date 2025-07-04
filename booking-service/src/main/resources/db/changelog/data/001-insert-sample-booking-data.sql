-- Sample bookings data
INSERT INTO bookings (booking_id, user_id, total_amount, currency, status, created_at) VALUES
(uuid_generate_v4(), uuid_generate_v4(), 1200000.00, 'VND', 'CONFIRMED', '2025-07-01 10:00:00+07'),
(uuid_generate_v4(), uuid_generate_v4(), 4500000.00, 'VND', 'PENDING', '2025-07-02 14:30:00+07'),
(uuid_generate_v4(), uuid_generate_v4(), 2800000.00, 'VND', 'CONFIRMED', '2025-07-03 09:15:00+07');

-- Sample booking_items data
-- Note: Using booking_id from above bookings (you would need to replace with actual IDs)
INSERT INTO booking_items (item_id, booking_id, service_type, provider_booking_ref, status, price, details) VALUES
(uuid_generate_v4(), (SELECT booking_id FROM bookings LIMIT 1), 'FLIGHT', 'VN101-20250705', 'CONFIRMED', 1200000.00, '{"flight_number": "VN101", "departure": "SGN", "arrival": "HAN", "date": "2025-07-05"}'),
(uuid_generate_v4(), (SELECT booking_id FROM bookings LIMIT 1 OFFSET 1), 'HOTEL', 'PH-SAIGON-001', 'PENDING', 4500000.00, '{"hotel_name": "Park Hyatt Saigon", "room_type": "Deluxe Room", "checkin": "2025-07-10", "checkout": "2025-07-12"}'),
(uuid_generate_v4(), (SELECT booking_id FROM bookings LIMIT 1 OFFSET 2), 'FLIGHT', 'VJ301-20250708', 'CONFIRMED', 2800000.00, '{"flight_number": "VJ301", "departure": "SGN", "arrival": "BKK", "date": "2025-07-08"}');

-- Sample sagas data
INSERT INTO sagas (saga_id, booking_id, saga_type, status, payload, created_at, updated_at) VALUES
(uuid_generate_v4(), (SELECT booking_id FROM bookings LIMIT 1), 'FLIGHT_BOOKING_SAGA', 'COMPLETED', '{"steps": ["RESERVE_SEAT", "PROCESS_PAYMENT", "CONFIRM_BOOKING"]}', '2025-07-01 10:00:00+07', '2025-07-01 10:05:00+07'),
(uuid_generate_v4(), (SELECT booking_id FROM bookings LIMIT 1 OFFSET 1), 'HOTEL_BOOKING_SAGA', 'AWAITING_PAYMENT', '{"steps": ["RESERVE_ROOM", "PROCESS_PAYMENT"]}', '2025-07-02 14:30:00+07', '2025-07-02 14:32:00+07');

-- Sample saga_steps data
INSERT INTO saga_steps (saga_id, step_name, status, request_payload, response_payload, start_time, end_time) VALUES
((SELECT saga_id FROM sagas LIMIT 1), 'RESERVE_SEAT', 'SUCCESS', '{"flight_id": 1, "seat_count": 1}', '{"reservation_id": "RES123", "status": "confirmed"}', '2025-07-01 10:00:00+07', '2025-07-01 10:01:00+07'),
((SELECT saga_id FROM sagas LIMIT 1), 'PROCESS_PAYMENT', 'SUCCESS', '{"amount": 1200000, "currency": "VND"}', '{"transaction_id": "TXN456", "status": "success"}', '2025-07-01 10:01:00+07', '2025-07-01 10:03:00+07'),
((SELECT saga_id FROM sagas LIMIT 1), 'CONFIRM_BOOKING', 'SUCCESS', '{"booking_reference": "VN101-20250705"}', '{"confirmation_code": "ABC123"}', '2025-07-01 10:03:00+07', '2025-07-01 10:05:00+07');
