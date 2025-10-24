-- liquibase formatted sql
-- changeset pdh:20251023-05-drop-old-functions
-- comment: Xóa 5 function cũ để chuẩn bị tạo lại
DROP FUNCTION IF EXISTS cleanup_old_flight_data(integer);
DROP FUNCTION IF EXISTS generate_daily_flight_data(date);
DROP FUNCTION IF EXISTS generate_flight_data_range(date, date);
DROP FUNCTION IF EXISTS get_flight_statistics(date);
DROP FUNCTION IF EXISTS update_existing_flight_schedule_statuses();
-- rollback: (Không cần)


-- changeset pdh:20251023-06-drop-old-schedule-constraint
-- comment: Xóa constraint unique cũ của flight_schedules
ALTER TABLE flight_schedules DROP CONSTRAINT IF EXISTS uk_flight_schedule_time;
-- rollback ALTER TABLE flight_schedules ADD CONSTRAINT uk_flight_schedule_time UNIQUE (flight_id, departure_time, arrival_time);

-- changeset pdh:20251023-07-create-partial-schedule-index
-- comment: Tạo partial unique index cho schedules (chỉ check các row active)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_schedules
    ON flight_schedules (flight_id, departure_time, arrival_time)
    WHERE (is_deleted = false);
-- rollback DROP INDEX IF EXISTS idx_unique_active_schedules;

-- changeset pdh:20251023-08-drop-old-fare-constraint
-- comment: Xóa constraint unique cũ của flight_fares
ALTER TABLE flight_fares DROP CONSTRAINT IF EXISTS uk_flight_fares_schedule_class;
-- rollback ALTER TABLE flight_fares ADD CONSTRAINT uk_flight_fares_schedule_class UNIQUE (schedule_id, fare_class);

-- changeset pdh:20251023-09-create-partial-fare-index
-- comment: Tạo partial unique index cho fares (chỉ check các row active)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_fares
    ON flight_fares (schedule_id, fare_class)
    WHERE (is_deleted = false);
-- rollback DROP INDEX IF EXISTS idx_unique_active_fares;


-- changeset pdh:20251023-10 runOnChange:true splitStatements:false endDelimiter:@@
-- comment: Tạo lại function generate_daily_flight_data (ĐÃ SỬA LỖI TRÙNG NGẪU NHIÊN)
CREATE OR REPLACE FUNCTION generate_daily_flight_data(target_date date DEFAULT (CURRENT_DATE + '1 day'::interval))
    RETURNS INTEGER
    LANGUAGE plpgsql
AS
$$
DECLARE
    flight_record RECORD;
    aircraft_record RECORD;
    schedule_count INTEGER := 0;
    random_hour INTEGER;
    random_minute INTEGER;
    departure_datetime TIMESTAMPTZ;
    arrival_datetime TIMESTAMPTZ;
    new_schedule_id UUID;
    selected_aircraft_id BIGINT;
    selected_aircraft_type TEXT;
    base_economy_price DECIMAL;
    base_business_price DECIMAL;
    price_variation DECIMAL;
    flights_per_route INTEGER;
    v_deleted_by_user TEXT := 'daily_generator_cleanup';
    v_generator_user TEXT := 'daily_generator';
    v_now TIMESTAMPTZ := NOW();
    temp_count INTEGER; --(FIX 1: Thêm biến đếm)
BEGIN
    -- (Logic soft-delete giữ nguyên...)
    UPDATE flight_fares ff
    SET is_deleted = true,
        deleted_at = v_now,
        deleted_by = v_deleted_by_user,
        updated_at = v_now,
        updated_by = v_deleted_by_user
    WHERE ff.is_deleted = false
      AND ff.schedule_id IN (
        SELECT fs.schedule_id
        FROM flight_schedules fs
        WHERE DATE(fs.departure_time) = target_date
          AND fs.is_deleted = false
    );

    UPDATE flight_schedules
    SET is_deleted = true,
        deleted_at = v_now,
        deleted_by = v_deleted_by_user,
        updated_at = v_now,
        updated_by = v_deleted_by_user
    WHERE DATE(departure_time) = target_date
      AND is_deleted = false;

    FOR flight_record IN
        SELECT f.flight_id, f.flight_number, f.base_duration_minutes, f.base_price, a.airline_id,
               f.departure_airport_id, f.arrival_airport_id, f.aircraft_id
        FROM flights f
                 JOIN airlines a ON f.airline_id = a.airline_id
        WHERE f.is_active = true AND f.is_deleted = false
        ORDER BY f.flight_id
        LOOP
            flights_per_route := 1 + FLOOR(RANDOM() * 3)::INTEGER;

            FOR i IN 1..flights_per_route LOOP
                random_hour := 6 + FLOOR(RANDOM() * 16)::INTEGER;
                random_minute := FLOOR(RANDOM() * 12)::INTEGER * 5;

                departure_datetime := (target_date + (random_hour || ' hours')::INTERVAL + (random_minute || ' minutes')::INTERVAL)::TIMESTAMPTZ;
                arrival_datetime := departure_datetime + (flight_record.base_duration_minutes || ' minutes')::INTERVAL;

                new_schedule_id := gen_random_uuid();

                IF flight_record.aircraft_id IS NOT NULL THEN
                    selected_aircraft_id := flight_record.aircraft_id;
                    SELECT model, manufacturer INTO aircraft_record
                    FROM aircraft
                    WHERE aircraft_id = selected_aircraft_id AND is_deleted = false;
                    selected_aircraft_type := aircraft_record.manufacturer || ' ' || aircraft_record.model;
                ELSE
                    SELECT aircraft_id, model, manufacturer INTO aircraft_record
                    FROM aircraft
                    WHERE is_active = true AND is_deleted = false
                    ORDER BY RANDOM()
                    LIMIT 1;
                    selected_aircraft_id := aircraft_record.aircraft_id;
                    selected_aircraft_type := aircraft_record.manufacturer || ' ' || aircraft_record.model;
                END IF;

                IF selected_aircraft_id IS NULL THEN
                    RAISE WARNING 'Could not find active aircraft for flight_id %, skipping schedule generation.', flight_record.flight_id;
                    CONTINUE;
                END IF;

                INSERT INTO flight_schedules (
                    schedule_id, flight_id, departure_time, arrival_time,
                    aircraft_id, aircraft_type, status,
                    created_at, created_by, updated_at, updated_by, is_deleted
                ) VALUES (
                             new_schedule_id,
                             flight_record.flight_id,
                             departure_datetime,
                             arrival_datetime,
                             selected_aircraft_id,
                             selected_aircraft_type,
                             'SCHEDULED',
                             v_now, v_generator_user, v_now, v_generator_user, false
                         )
                --(FIX 2: Thêm ON CONFLICT để xử lý trùng lặp ngẫu nhiên)
                ON CONFLICT (flight_id, departure_time, arrival_time) WHERE (is_deleted = false)
                DO NOTHING;
                
                --(FIX 3: Kiểm tra xem lệnh INSERT bên trên có thành công không)
                GET DIAGNOSTICS temp_count = ROW_COUNT;

                -- Chỉ insert giá vé NẾU lịch bay được insert thành công (temp_count = 1)
                IF temp_count = 1 THEN 
                    CASE flight_record.airline_id
                        WHEN 1 THEN
                            base_economy_price := flight_record.base_price * (1.2 + RANDOM() * 0.3);
                            base_business_price := base_economy_price * (2.5 + RANDOM() * 0.5);
                        WHEN 2 THEN
                            base_economy_price := flight_record.base_price * (0.8 + RANDOM() * 0.4);
                            base_business_price := base_economy_price * (2.0 + RANDOM() * 0.5);
                        WHEN 3 THEN
                            base_economy_price := flight_record.base_price * (0.7 + RANDOM() * 0.4);
                            base_business_price := base_economy_price * (1.8 + RANDOM() * 0.4);
                        ELSE
                            base_economy_price := flight_record.base_price * (1.0 + RANDOM() * 0.3);
                            base_business_price := base_economy_price * (2.2 + RANDOM() * 0.6);
                    END CASE;

                    IF random_hour BETWEEN 7 AND 9 OR random_hour BETWEEN 17 AND 19 THEN
                        price_variation := 1.15 + RANDOM() * 0.1;
                    ELSE
                        price_variation := 0.95 + RANDOM() * 0.1;
                    END IF;

                    base_economy_price := base_economy_price * price_variation;
                    base_business_price := base_business_price * price_variation;

                    INSERT INTO flight_fares (
                        fare_id, schedule_id, fare_class, price, available_seats,
                        created_at, created_by, updated_at, updated_by, is_deleted
                    ) VALUES (
                                 gen_random_uuid(), new_schedule_id, 'ECONOMY',
                                 ROUND(base_economy_price, 0), 120 + FLOOR(RANDOM() * 100)::INTEGER,
                                 v_now, v_generator_user, v_now, v_generator_user, false
                             ) ON CONFLICT (schedule_id, fare_class) WHERE (is_deleted = false) DO NOTHING;

                    INSERT INTO flight_fares (
                        fare_id, schedule_id, fare_class, price, available_seats,
                        created_at, created_by, updated_at, updated_by, is_deleted
                    ) VALUES (
                                 gen_random_uuid(), new_schedule_id, 'BUSINESS',
                                 ROUND(base_business_price, 0), 12 + FLOOR(RANDOM() * 20)::INTEGER,
                                 v_now, v_generator_user, v_now, v_generator_user, false
                             ) ON CONFLICT (schedule_id, fare_class) WHERE (is_deleted = false) DO NOTHING;
                
                END IF; -- Kết thúc IF temp_count = 1

                --(FIX 4: Chỉ cộng vào 'schedule_count' nếu insert thành công)
                schedule_count := schedule_count + temp_count;

            END LOOP;
        END LOOP;

    RETURN schedule_count;
END;
$$
@@
-- rollback DROP FUNCTION IF EXISTS generate_daily_flight_data(date);

-- changeset pdh:20251023-11-owner-generate-daily
ALTER FUNCTION generate_daily_flight_data(date) OWNER TO postgres;
-- rollback: (Không cần)


-- changeset pdh:20251023-12-create-cleanup-old-flight-data splitStatements:false endDelimiter:@@
-- comment: Tạo function cleanup_old_flight_data (dùng arrival_time và soft-delete)
CREATE FUNCTION cleanup_old_flight_data(p_cutoff_date DATE DEFAULT CURRENT_DATE)
    RETURNS JSON
    LANGUAGE plpgsql
AS
$$
DECLARE
    v_deleted_fares_count INT := 0;
    v_deleted_schedules_count INT := 0;
    v_deleted_by_user TEXT := 'cleanup_job';
    v_now TIMESTAMPTZ := NOW();
    affected_rows INT;
BEGIN
    RAISE NOTICE 'Bắt đầu XÓA MỀM các chuyến bay hoàn thành trước ngày %...', p_cutoff_date;

    WITH schedules_to_delete AS (
        SELECT schedule_id
        FROM flight_schedules
        WHERE arrival_time < p_cutoff_date::TIMESTAMPTZ
          AND is_deleted = false
    )
    UPDATE flight_fares
    SET is_deleted = true,
        deleted_at = v_now,
        deleted_by = v_deleted_by_user,
        updated_at = v_now,
        updated_by = v_deleted_by_user
    WHERE schedule_id IN (SELECT schedule_id FROM schedules_to_delete)
      AND is_deleted = false;

    GET DIAGNOSTICS v_deleted_fares_count = ROW_COUNT;

    UPDATE flight_schedules
    SET is_deleted = true,
        deleted_at = v_now,
        deleted_by = v_deleted_by_user,
        updated_at = v_now,
        updated_by = v_deleted_by_user
    WHERE arrival_time < p_cutoff_date::TIMESTAMPTZ
      AND is_deleted = false;

    GET DIAGNOSTICS v_deleted_schedules_count = ROW_COUNT;

    RAISE NOTICE 'Đã xóa mềm % lịch bay và % giá vé.', v_deleted_schedules_count, v_deleted_fares_count;

    RETURN json_build_object(
            'soft_deleted_schedules', v_deleted_schedules_count,
            'soft_deleted_fares', v_deleted_fares_count,
            'cutoff_date', p_cutoff_date
           );
END;
$$
@@
-- rollback DROP FUNCTION IF EXISTS cleanup_old_flight_data(date);

-- changeset pdh:20251023-13-owner-cleanup
ALTER FUNCTION cleanup_old_flight_data(date) OWNER TO postgres;
-- rollback: (Không cần)


-- changeset pdh:20251023-14-create-generate-flight-data-range splitStatements:false endDelimiter:@@
-- comment: Tạo lại function generate_flight_data_range (wrapper)
CREATE FUNCTION generate_flight_data_range(start_date date, end_date date)
    RETURNS TABLE(date_generated date, schedules_created integer)
    LANGUAGE plpgsql
AS
$$
DECLARE
    current_target_date DATE;
    schedules_count INTEGER;
BEGIN
    IF start_date > end_date THEN
        RAISE EXCEPTION 'Start date must be before or equal to end date';
    END IF;

    current_target_date := start_date;
    WHILE current_target_date <= end_date LOOP
        SELECT generate_daily_flight_data(current_target_date) INTO schedules_count;

        date_generated := current_target_date;
        schedules_created := schedules_count;
        RETURN NEXT;

        current_target_date := current_target_date + INTERVAL '1 day';
    END LOOP;

    RETURN;
END;
$$
@@
-- rollback DROP FUNCTION IF EXISTS generate_flight_data_range(date, date);

-- changeset pdh:20251023-15-owner-generate-range
ALTER FUNCTION generate_flight_data_range(date, date) OWNER TO postgres;
-- rollback: (Không cần)


-- changeset pdh:20251023-16-create-get-flight-statistics splitStatements:false endDelimiter:@@
-- comment: Tạo lại function get_flight_statistics
CREATE FUNCTION get_flight_statistics(target_date date DEFAULT CURRENT_DATE)
    RETURNS TABLE(total_schedules integer, scheduled_count integer, active_count integer, delayed_count integer, cancelled_count integer, completed_count integer, total_flights integer, unique_routes integer)
    LANGUAGE plpgsql
AS
$$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM flight_schedules fs WHERE DATE(fs.departure_time) = target_date AND fs.is_deleted = false) as total_schedules,
        (SELECT COUNT(*)::INTEGER FROM flight_schedules fs WHERE DATE(fs.departure_time) = target_date AND fs.status = 'SCHEDULED' AND fs.is_deleted = false) as scheduled_count,
        (SELECT COUNT(*)::INTEGER FROM flight_schedules fs WHERE DATE(fs.departure_time) = target_date AND fs.status = 'ACTIVE' AND fs.is_deleted = false) as active_count,
        (SELECT COUNT(*)::INTEGER FROM flight_schedules fs WHERE DATE(fs.departure_time) = target_date AND fs.status = 'DELAYED' AND fs.is_deleted = false) as delayed_count,
        (SELECT COUNT(*)::INTEGER FROM flight_schedules fs WHERE DATE(fs.departure_time) = target_date AND fs.status = 'CANCELLED' AND fs.is_deleted = false) as cancelled_count,
        (SELECT COUNT(*)::INTEGER FROM flight_schedules fs WHERE DATE(fs.departure_time) = target_date AND fs.status = 'COMPLETED' AND fs.is_deleted = false) as completed_count,
        (SELECT COUNT(DISTINCT fs.flight_id)::INTEGER FROM flight_schedules fs WHERE DATE(fs.departure_time) = target_date AND fs.is_deleted = false) as total_flights,
        (SELECT COUNT(DISTINCT CONCAT(f.departure_airport_id, '-', f.arrival_airport_id))::INTEGER
         FROM flight_schedules fs
                  JOIN flights f ON fs.flight_id = f.flight_id
         WHERE DATE(fs.departure_time) = target_date AND fs.is_deleted = false) as unique_routes;
END;
$$
@@
-- rollback DROP FUNCTION IF EXISTS get_flight_statistics(date);

-- changeset pdh:20251023-17-owner-get-statistics
ALTER FUNCTION get_flight_statistics(date) OWNER TO postgres;
-- rollback: (Không cần)


-- changeset pdh:20251023-18-create-update-schedule-statuses splitStatements:false endDelimiter:@@
-- comment: Tạo lại function update_existing_flight_schedule_statuses
CREATE FUNCTION update_existing_flight_schedule_statuses()
    RETURNS INTEGER
    LANGUAGE plpgsql
AS
$$
DECLARE
    updated_count INTEGER := 0;
    temp_count INTEGER := 0;
    current_time TIMESTAMPTZ := NOW();
    v_updater_user TEXT := 'status_migration';
BEGIN
    UPDATE flight_schedules
    SET status = 'COMPLETED',
        updated_at = current_time,
        updated_by = v_updater_user
    WHERE arrival_time < current_time
      AND status IN ('SCHEDULED', 'ACTIVE', 'DELAYED')
      AND is_deleted = false;

    GET DIAGNOSTICS updated_count = ROW_COUNT;

    UPDATE flight_schedules
    SET status = 'ACTIVE',
        updated_at = current_time,
        updated_by = v_updater_user
    WHERE departure_time BETWEEN current_time AND current_time + INTERVAL '1 hour'
      AND status = 'SCHEDULED'
      AND is_deleted = false;

    GET DIAGNOSTICS temp_count = ROW_COUNT;
    updated_count := updated_count + temp_count;

    RETURN updated_count;
END;
$$
@@
-- rollback DROP FUNCTION IF EXISTS update_existing_flight_schedule_statuses();

-- changeset pdh:20251023-19-owner-update-statuses
ALTER FUNCTION update_existing_flight_schedule_statuses() OWNER TO postgres;
-- rollback: (Không cần)