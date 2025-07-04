-- Sample Cities data
INSERT INTO Cities (name, country) VALUES
('Ho Chi Minh City', 'Vietnam'),
('Hanoi', 'Vietnam'),
('Da Nang', 'Vietnam'),
('Hoi An', 'Vietnam'),
('Nha Trang', 'Vietnam');

-- Sample Hotels data
INSERT INTO Hotels (name, address, city_id, star_rating, description, latitude, longitude, checkin_time, checkout_time) VALUES
('Park Hyatt Saigon', '2 Lam Son Square, District 1', 1, 5, 'Luxury hotel in the heart of Ho Chi Minh City', 10.776530, 106.703567, '15:00', '12:00'),
('Hotel Nikko Saigon', '235 Nguyen Van Cu, District 1', 1, 5, 'Japanese hospitality in downtown Saigon', 10.768030, 106.695220, '14:00', '12:00'),
('JW Marriott Hanoi', '8 Do Duc Duc, Me Tri, Nam Tu Liem', 2, 5, 'Contemporary luxury hotel in Hanoi', 21.013970, 105.781940, '15:00', '12:00'),
('InterContinental Danang Sun Peninsula Resort', 'Bai Bac, Son Tra Peninsula', 3, 5, 'Beachfront resort with stunning views', 16.102440, 108.251160, '15:00', '11:00');

-- Sample Amenities data
INSERT INTO Amenities (name, category) VALUES
('Free WiFi', 'HOTEL'),
('Swimming Pool', 'HOTEL'),
('Fitness Center', 'HOTEL'),
('Spa', 'HOTEL'),
('Restaurant', 'HOTEL'),
('Bar', 'HOTEL'),
('Business Center', 'HOTEL'),
('Air Conditioning', 'ROOM'),
('Mini Bar', 'ROOM'),
('Safe', 'ROOM'),
('Balcony', 'ROOM'),
('Ocean View', 'ROOM');

-- Sample Hotel_Amenities data
INSERT INTO Hotel_Amenities (hotel_id, amenity_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7),
(2, 1), (2, 2), (2, 3), (2, 5), (2, 6), (2, 7),
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6),
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6);

-- Sample RoomTypes data
INSERT INTO RoomTypes (hotel_id, name, description, capacity_adults, capacity_children, base_price) VALUES
(1, 'Deluxe Room', 'Spacious room with city view', 2, 1, 4500000.00),
(1, 'Park Suite', 'Luxury suite with park view', 2, 2, 8500000.00),
(2, 'Superior Room', 'Modern room with contemporary design', 2, 1, 3800000.00),
(2, 'Executive Suite', 'Premium suite with executive lounge access', 2, 2, 7200000.00),
(3, 'Deluxe Room', 'Elegant room in Hanoi', 2, 1, 4200000.00),
(4, 'Ocean View Room', 'Room with breathtaking ocean views', 2, 1, 6500000.00);

-- Sample Room_Availability data (for next 30 days)
INSERT INTO Room_Availability (room_type_id, date, total_inventory, total_reserved, price_override) VALUES
(1, '2025-07-05', 20, 0, NULL),
(1, '2025-07-06', 20, 0, NULL),
(1, '2025-07-07', 20, 0, 5000000.00), -- Weekend pricing
(2, '2025-07-05', 5, 0, NULL),
(2, '2025-07-06', 5, 0, NULL),
(3, '2025-07-05', 25, 0, NULL),
(3, '2025-07-06', 25, 0, NULL),
(4, '2025-07-05', 8, 0, NULL),
(5, '2025-07-05', 15, 0, NULL),
(6, '2025-07-05', 12, 0, NULL);

-- Sample Reviews data
INSERT INTO Reviews (hotel_id, user_id, rating, comment_text, created_at) VALUES
(1, uuid_generate_v4(), 5, 'Excellent service and beautiful rooms. Highly recommended!', '2025-06-01 10:00:00+07'),
(1, uuid_generate_v4(), 4, 'Great location and friendly staff.', '2025-06-15 14:30:00+07'),
(2, uuid_generate_v4(), 5, 'Outstanding Japanese hospitality.', '2025-06-20 09:15:00+07'),
(3, uuid_generate_v4(), 4, 'Modern hotel with good facilities.', '2025-06-25 16:45:00+07');

-- Sample Hotel_Photos data
INSERT INTO Hotel_Photos (hotel_id, url, description, is_primary) VALUES
(1, 'https://example.com/park-hyatt-exterior.jpg', 'Hotel exterior', TRUE),
(1, 'https://example.com/park-hyatt-lobby.jpg', 'Hotel lobby', FALSE),
(1, 'https://example.com/park-hyatt-room.jpg', 'Deluxe room', FALSE),
(2, 'https://example.com/nikko-exterior.jpg', 'Hotel exterior', TRUE),
(2, 'https://example.com/nikko-pool.jpg', 'Swimming pool', FALSE),
(3, 'https://example.com/marriott-exterior.jpg', 'Hotel exterior', TRUE),
(4, 'https://example.com/intercontinental-exterior.jpg', 'Resort exterior', TRUE),
(4, 'https://example.com/intercontinental-beach.jpg', 'Beach view', FALSE);
