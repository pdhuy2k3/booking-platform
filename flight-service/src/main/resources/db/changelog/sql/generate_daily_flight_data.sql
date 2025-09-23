CREATE OR REPLACE FUNCTION generate_daily_flight_data(target_date DATE DEFAULT CURRENT_DATE + INTERVAL '1 day')
RETURNS INTEGER AS $$
DECLARE
    flight_record RECORD;
    schedule_count INTEGER := 0;
    random_hour INTEGER;
    random_minute INTEGER;
    departure_datetime TIMESTAMP;
    arrival_datetime TIMESTAMP;
    new_schedule_id UUID;
    aircraft_types TEXT[] := ARRAY['Airbus A320', 'Airbus A321', 'Boeing 787', 'ATR 72', 'Boeing 737'];
    selected_aircraft TEXT;
    base_economy_price DECIMAL;
    base_business_price DECIMAL;
    price_variation DECIMAL;
    flights_per_route INTEGER;
BEGIN
    -- Delete existing schedules for the target date to avoid duplicates
    DELETE FROM flight_fares ff 
    WHERE ff.schedule_id IN (
        SELECT fs.schedule_id 
        FROM flight_schedules fs 
        WHERE DATE(fs.departure_time) = target_date
    );
    
    DELETE FROM flight_schedules 
    WHERE DATE(departure_time) = target_date;
    
    -- Generate schedules for each flight route
    FOR flight_record IN 
        SELECT f.flight_id, f.flight_number, f.base_duration_minutes, f.base_price, a.airline_id,
               f.departure_airport_id, f.arrival_airport_id
        FROM flights f
        JOIN airlines a ON f.airline_id = a.airline_id
        WHERE f.is_active = true AND f.is_deleted = false
        ORDER BY f.flight_id
    LOOP
        -- Generate 1-3 flights per route per day
        flights_per_route := 1 + FLOOR(RANDOM() * 3)::INTEGER;
        
        FOR i IN 1..flights_per_route LOOP
            -- Generate random departure time
            random_hour := 6 + FLOOR(RANDOM() * 16)::INTEGER; -- 6 AM to 10 PM
            random_minute := FLOOR(RANDOM() * 12)::INTEGER * 5; -- 0, 5, 10, ..., 55
            
            departure_datetime := target_date + (random_hour || ' hours')::INTERVAL + (random_minute || ' minutes')::INTERVAL;
            arrival_datetime := departure_datetime + (flight_record.base_duration_minutes || ' minutes')::INTERVAL;
            
            -- Generate UUID for schedule
            new_schedule_id := gen_random_uuid();
            
            -- Select random aircraft type
            selected_aircraft := aircraft_types[1 + FLOOR(RANDOM() * array_length(aircraft_types, 1))::INTEGER];
            
            -- Insert flight schedule with proper enum status
            INSERT INTO flight_schedules (
                schedule_id, flight_id, departure_time, arrival_time, 
                aircraft_type, status, created_at, created_by, updated_at, updated_by, is_deleted
            ) VALUES (
                new_schedule_id,
                flight_record.flight_id,
                departure_datetime,
                arrival_datetime,
                selected_aircraft,
                'SCHEDULED', -- Use enum value
                NOW(), 'daily_generator', NOW(), 'daily_generator', false
            );
            
            -- Calculate base prices based on airline
            CASE flight_record.airline_id
                WHEN 1 THEN -- Vietnam Airlines (premium)
                    base_economy_price := flight_record.base_price * (1.2 + RANDOM() * 0.3);
                    base_business_price := base_economy_price * (2.5 + RANDOM() * 0.5);
                WHEN 2 THEN -- VietJet Air (budget)
                    base_economy_price := flight_record.base_price * (0.8 + RANDOM() * 0.4);
                    base_business_price := base_economy_price * (2.0 + RANDOM() * 0.5);
                WHEN 3 THEN -- Jetstar Pacific (budget)
                    base_economy_price := flight_record.base_price * (0.7 + RANDOM() * 0.4);
                    base_business_price := base_economy_price * (1.8 + RANDOM() * 0.4);
                ELSE -- Other airlines
                    base_economy_price := flight_record.base_price * (1.0 + RANDOM() * 0.3);
                    base_business_price := base_economy_price * (2.2 + RANDOM() * 0.6);
            END CASE;
            
            -- Add time-based price variation (peak hours more expensive)
            IF random_hour BETWEEN 7 AND 9 OR random_hour BETWEEN 17 AND 19 THEN
                price_variation := 1.15 + RANDOM() * 0.1; -- Peak hours
            ELSE
                price_variation := 0.95 + RANDOM() * 0.1; -- Off-peak hours
            END IF;
            
            base_economy_price := base_economy_price * price_variation;
            base_business_price := base_business_price * price_variation;
            
            -- Insert Economy fare (use ON CONFLICT for unique constraint)
            INSERT INTO flight_fares (
                fare_id, schedule_id, fare_class, price, available_seats,
                created_at, created_by, updated_at, updated_by, is_deleted
            ) VALUES (
                gen_random_uuid(),
                new_schedule_id,
                'ECONOMY',
                ROUND(base_economy_price, 0),
                120 + FLOOR(RANDOM() * 100)::INTEGER, -- 120-220 economy seats
                NOW(), 'daily_generator', NOW(), 'daily_generator', false
            ) ON CONFLICT (schedule_id, fare_class) DO NOTHING;
            
            -- Insert Business fare (use ON CONFLICT for unique constraint)
            INSERT INTO flight_fares (
                fare_id, schedule_id, fare_class, price, available_seats,
                created_at, created_by, updated_at, updated_by, is_deleted
            ) VALUES (
                gen_random_uuid(),
                new_schedule_id,
                'BUSINESS',
                ROUND(base_business_price, 0),
                12 + FLOOR(RANDOM() * 20)::INTEGER, -- 12-32 business seats
                NOW(), 'daily_generator', NOW(), 'daily_generator', false
            ) ON CONFLICT (schedule_id, fare_class) DO NOTHING;
            
            schedule_count := schedule_count + 1;
        END LOOP;
    END LOOP;
    
    RETURN schedule_count;
END;
$$ LANGUAGE plpgsql;