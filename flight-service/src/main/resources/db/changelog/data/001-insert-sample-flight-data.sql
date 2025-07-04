-- Sample Airlines data
INSERT INTO Airlines (name, iata_code, logo_url) VALUES
('Vietnam Airlines', 'VN', 'https://example.com/vn-logo.png'),
('Jetstar Pacific', 'BL', 'https://example.com/bl-logo.png'),
('VietJet Air', 'VJ', 'https://example.com/vj-logo.png');

-- Sample Airports data
INSERT INTO Airports (name, iata_code, city, country) VALUES
('Tan Son Nhat International Airport', 'SGN', 'Ho Chi Minh City', 'Vietnam'),
('Noi Bai International Airport', 'HAN', 'Hanoi', 'Vietnam'),
('Da Nang International Airport', 'DAD', 'Da Nang', 'Vietnam'),
('Changi Airport', 'SIN', 'Singapore', 'Singapore'),
('Suvarnabhumi Airport', 'BKK', 'Bangkok', 'Thailand');

-- Sample Flights data
INSERT INTO Flights (flight_number, airline_id, aircraft_type) VALUES
('VN101', 1, 'Airbus A321'),
('VN102', 1, 'Airbus A321'),
('BL201', 2, 'Boeing 737'),
('VJ301', 3, 'Airbus A320');

-- Sample Flight_Legs data
INSERT INTO Flight_Legs (flight_id, leg_number, departure_airport_id, arrival_airport_id, departure_time, arrival_time) VALUES
(1, 1, 1, 2, '2025-07-05 08:00:00+07', '2025-07-05 10:15:00+07'),
(2, 1, 2, 1, '2025-07-05 14:00:00+07', '2025-07-05 16:15:00+07'),
(3, 1, 1, 4, '2025-07-05 09:30:00+07', '2025-07-05 11:00:00+08'),
(4, 1, 1, 5, '2025-07-05 15:45:00+07', '2025-07-05 17:30:00+07');

-- Sample FlightFares data
INSERT INTO FlightFares (flight_id, fare_class, price, conditions) VALUES
(1, 'ECONOMY', 1200000.00, 'Non-refundable, change fee applies'),
(1, 'BUSINESS', 2500000.00, 'Refundable with conditions'),
(2, 'ECONOMY', 1200000.00, 'Non-refundable, change fee applies'),
(2, 'BUSINESS', 2500000.00, 'Refundable with conditions'),
(3, 'ECONOMY', 3500000.00, 'International flight rules apply'),
(4, 'ECONOMY', 2800000.00, 'International flight rules apply');

-- Sample Flight_Inventory data
INSERT INTO Flight_Inventory (flight_leg_id, fare_class, total_seats, reserved_seats) VALUES
(1, 'ECONOMY', 150, 0),
(1, 'BUSINESS', 20, 0),
(2, 'ECONOMY', 150, 0),
(2, 'BUSINESS', 20, 0),
(3, 'ECONOMY', 180, 0),
(4, 'ECONOMY', 180, 0);
