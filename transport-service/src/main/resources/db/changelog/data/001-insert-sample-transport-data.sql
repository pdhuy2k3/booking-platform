-- Sample operators data
INSERT INTO operators (name) VALUES
('Phương Trang (Futa Bus Lines)'),
('Mai Linh Express'),
('Hoang Long'),
('Vietnam Railways'),
('Sinh Tourist'),
('The Sinh Tourist');

-- Sample stops data
INSERT INTO stops (name, address) VALUES
('Bến xe Miền Đông', '292 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM'),
('Bến xe Miền Tây', '395 Kinh Dương Vương, An Lạc, Bình Tân, TP.HCM'),
('Bến xe An Sương', 'Quốc lộ 22, Hóc Môn, TP.HCM'),
('Ga Sài Gòn', '1 Nguyễn Thông, Quận 3, TP.HCM'),
('Bến xe Gia Lâm', 'Long Biên, Hà Nội'),
('Ga Hà Nội', '120 Lê Duẩn, Hoàn Kiếm, Hà Nội'),
('Bến xe Đà Nẵng', '201 Tôn Đức Thắng, Liên Chiểu, Đà Nẵng'),
('Ga Đà Nẵng', '791 Hải Phòng, Thanh Khê, Đà Nẵng');

-- Sample routes data
INSERT INTO routes (name, operator_id) VALUES
('TP.HCM - Đà Nẵng', 1),
('TP.HCM - Hà Nội', 4),
('TP.HCM - Cần Thơ', 2),
('Hà Nội - Đà Nẵng', 4),
('TP.HCM - Vũng Tàu', 3);

-- Sample route_stops data
INSERT INTO route_stops (route_id, stop_id, stop_order, travel_time_from_previous_mins) VALUES
-- Route 1: TP.HCM - Đà Nẵng
(1, 1, 1, 0),      -- Departure from Bến xe Miền Đông
(1, 7, 2, 720),    -- Arrival at Bến xe Đà Nẵng (12 hours)

-- Route 2: TP.HCM - Hà Nội (by train)
(2, 4, 1, 0),      -- Departure from Ga Sài Gòn
(2, 6, 2, 1980),   -- Arrival at Ga Hà Nội (33 hours)

-- Route 3: TP.HCM - Cần Thơ
(3, 2, 1, 0),      -- Departure from Bến xe Miền Tây
(3, 3, 2, 180);    -- Arrival at An Sương (3 hours - example stop)

-- Sample route_fares data
INSERT INTO route_fares (route_id, origin_stop_id, destination_stop_id, price) VALUES
(1, 1, 7, 350000.00),    -- TP.HCM to Đà Nẵng by bus
(2, 4, 6, 800000.00),    -- TP.HCM to Hà Nội by train (soft seat)
(3, 2, 3, 120000.00);    -- TP.HCM to Cần Thơ

-- Sample seat_layouts data
INSERT INTO seat_layouts (name, layout_data) VALUES
('Bus 45 Seats Standard', '{"rows": 11, "seats_per_row": 4, "total_seats": 45, "layout": "2+2"}'),
('Bus 40 Seats VIP', '{"rows": 10, "seats_per_row": 4, "total_seats": 40, "layout": "2+2", "reclining": true}'),
('Train Soft Seat 64', '{"rows": 16, "seats_per_row": 4, "total_seats": 64, "layout": "2+2"}'),
('Train Hard Seat 118', '{"rows": 20, "seats_per_row": 6, "total_seats": 118, "layout": "3+3"}');

-- Sample vehicles data
INSERT INTO vehicles (license_plate, type, layout_id) VALUES
('51B-12345', 'BUS', 1),
('51B-67890', 'BUS', 2),
('TRAIN-SE1', 'TRAIN', 3),
('TRAIN-SE3', 'TRAIN', 4),
('79B-11111', 'BUS', 1);

-- Sample seats data (for first bus only, to demonstrate)
INSERT INTO seats (vehicle_id, seat_number) VALUES
-- Bus 51B-12345 (45 seats)
(1, '1A'), (1, '1B'), (1, '1C'), (1, '1D'),
(1, '2A'), (1, '2B'), (1, '2C'), (1, '2D'),
(1, '3A'), (1, '3B'), (1, '3C'), (1, '3D'),
(1, '4A'), (1, '4B'), (1, '4C'), (1, '4D'),
(1, '5A'), (1, '5B'), (1, '5C'), (1, '5D');

-- Sample trips data
INSERT INTO trips (route_id, vehicle_id, departure_datetime) VALUES
(1, 1, '2025-07-05 08:00:00+07'),    -- TP.HCM to Đà Nẵng
(1, 2, '2025-07-05 14:00:00+07'),    -- TP.HCM to Đà Nẵng (VIP bus)
(2, 3, '2025-07-05 19:30:00+07'),    -- TP.HCM to Hà Nội (train)
(3, 5, '2025-07-05 09:00:00+07');    -- TP.HCM to Cần Thơ

-- Sample seat_reservations_by_leg data
INSERT INTO seat_reservations_by_leg (trip_id, seat_id, booking_item_id, departure_stop_id, arrival_stop_id) VALUES
(1, 1, uuid_generate_v4(), 1, 7),    -- Seat 1A reserved for full journey
(1, 2, uuid_generate_v4(), 1, 7),    -- Seat 1B reserved for full journey
(2, 21, uuid_generate_v4(), 1, 7);   -- VIP bus reservation
