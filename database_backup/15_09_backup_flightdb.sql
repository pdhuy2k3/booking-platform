--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.5

-- Started on 2025-09-15 15:15:43

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 241 (class 1255 OID 57887)
-- Name: cleanup_old_flight_data(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cleanup_old_flight_data(days_to_keep integer DEFAULT 30) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    cleanup_date DATE;
    deleted_fares INTEGER;
    deleted_schedules INTEGER;
BEGIN
    cleanup_date := CURRENT_DATE - INTERVAL '1 day' * days_to_keep;
    
    -- Delete old flight fares first (due to foreign key constraint)
    DELETE FROM flight_fares ff 
    WHERE ff.schedule_id IN (
        SELECT fs.schedule_id 
        FROM flight_schedules fs 
        WHERE DATE(fs.departure_time) < cleanup_date
    );
    
    GET DIAGNOSTICS deleted_fares = ROW_COUNT;
    
    -- Delete old flight schedules
    DELETE FROM flight_schedules 
    WHERE DATE(departure_time) < cleanup_date;
    
    GET DIAGNOSTICS deleted_schedules = ROW_COUNT;
    
    -- Log the cleanup activity
    RAISE NOTICE 'Cleaned up % fares and % schedules older than %', deleted_fares, deleted_schedules, cleanup_date;
    
    RETURN deleted_schedules;
END;
$$;


ALTER FUNCTION public.cleanup_old_flight_data(days_to_keep integer) OWNER TO postgres;

--
-- TOC entry 242 (class 1255 OID 57888)
-- Name: generate_daily_flight_data(date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_daily_flight_data(target_date date DEFAULT (CURRENT_DATE + '1 day'::interval)) RETURNS integer
    LANGUAGE plpgsql
    AS $$
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
        SELECT f.flight_id, f.flight_number, f.airline_id, f.base_duration_minutes,
               dep.name as dep_airport, arr.name as arr_airport
        FROM flights f
        JOIN airports dep ON f.departure_airport_id = dep.airport_id
        JOIN airports arr ON f.arrival_airport_id = arr.airport_id
        ORDER BY f.flight_id
    LOOP
        -- Generate 2-4 random flights per route per day
        flights_per_route := 2 + FLOOR(RANDOM() * 3)::INTEGER;
        
        FOR i IN 1..flights_per_route LOOP
            -- Random departure time between 6:00 and 22:00
            random_hour := 6 + FLOOR(RANDOM() * 16)::INTEGER;
            random_minute := FLOOR(RANDOM() * 12)::INTEGER * 5; -- 5-minute intervals
            
            departure_datetime := target_date + (random_hour || ' hours')::INTERVAL + (random_minute || ' minutes')::INTERVAL;
            arrival_datetime := departure_datetime + (flight_record.base_duration_minutes || ' minutes')::INTERVAL;
            
            -- Generate UUID for schedule
            new_schedule_id := gen_random_uuid();
            
            -- Select random aircraft type
            selected_aircraft := aircraft_types[1 + FLOOR(RANDOM() * array_length(aircraft_types, 1))::INTEGER];
            
            -- Insert flight schedule
            INSERT INTO flight_schedules (
                schedule_id, flight_id, departure_time, arrival_time, 
                aircraft_type, status, created_at, created_by, updated_at, updated_by, is_deleted
            ) VALUES (
                new_schedule_id,
                flight_record.flight_id,
                departure_datetime,
                arrival_datetime,
                selected_aircraft,
                'SCHEDULED',
                NOW(), 'daily_generator', NOW(), 'daily_generator', false
            );
            
            -- Calculate base prices based on airline
            CASE flight_record.airline_id
                WHEN 1 THEN -- Vietnam Airlines (premium pricing)
                    base_economy_price := 2000000 + (RANDOM() * 1000000);
                    base_business_price := 4000000 + (RANDOM() * 1500000);
                WHEN 2 THEN -- VietJet (budget pricing)
                    base_economy_price := 1200000 + (RANDOM() * 800000);
                    base_business_price := 2800000 + (RANDOM() * 1200000);
                WHEN 3 THEN -- Bamboo Airways (mid-range pricing)
                    base_economy_price := 1600000 + (RANDOM() * 900000);
                    base_business_price := 3500000 + (RANDOM() * 1300000);
                WHEN 4 THEN -- Pacific Airlines
                    base_economy_price := 1400000 + (RANDOM() * 600000);
                    base_business_price := 3000000 + (RANDOM() * 1000000);
                ELSE
                    base_economy_price := 1500000 + (RANDOM() * 700000);
                    base_business_price := 3200000 + (RANDOM() * 1000000);
            END CASE;
            
            -- Add price variation based on time of day (peak hours cost more)
            price_variation := CASE 
                WHEN random_hour BETWEEN 7 AND 9 OR random_hour BETWEEN 17 AND 19 THEN 1.2 -- Peak hours
                WHEN random_hour BETWEEN 12 AND 14 THEN 1.1 -- Lunch time
                WHEN random_hour BETWEEN 22 AND 23 OR random_hour BETWEEN 5 AND 6 THEN 0.9 -- Off-peak
                ELSE 1.0 -- Regular hours
            END;
            
            -- Generate Economy fare
            INSERT INTO flight_fares (
                fare_id, schedule_id, fare_class, price, available_seats,
                created_at, created_by, updated_at, updated_by, is_deleted
            ) VALUES (
                gen_random_uuid(),
                new_schedule_id,
                'ECONOMY',
                ROUND(base_economy_price * price_variation),
                CASE 
                    WHEN selected_aircraft LIKE '%ATR%' THEN 50 + FLOOR(RANDOM() * 20)::INTEGER -- ATR: 50-70 seats
                    WHEN selected_aircraft LIKE '%A320%' THEN 140 + FLOOR(RANDOM() * 40)::INTEGER -- A320: 140-180 seats
                    WHEN selected_aircraft LIKE '%A321%' THEN 160 + FLOOR(RANDOM() * 40)::INTEGER -- A321: 160-200 seats
                    WHEN selected_aircraft LIKE '%787%' THEN 200 + FLOOR(RANDOM() * 50)::INTEGER -- 787: 200-250 seats
                    ELSE 120 + FLOOR(RANDOM() * 60)::INTEGER -- Default: 120-180 seats
                END,
                NOW(), 'daily_generator', NOW(), 'daily_generator', false
            );
            
            -- Generate Business fare (only for larger aircraft, not ATR)
            IF selected_aircraft NOT LIKE '%ATR%' THEN
                INSERT INTO flight_fares (
                    fare_id, schedule_id, fare_class, price, available_seats,
                    created_at, created_by, updated_at, updated_by, is_deleted
                ) VALUES (
                    gen_random_uuid(),
                    new_schedule_id,
                    'BUSINESS',
                    ROUND(base_business_price * price_variation),
                    CASE 
                        WHEN selected_aircraft LIKE '%A320%' THEN 12 + FLOOR(RANDOM() * 8)::INTEGER -- A320: 12-20 seats
                        WHEN selected_aircraft LIKE '%A321%' THEN 16 + FLOOR(RANDOM() * 12)::INTEGER -- A321: 16-28 seats
                        WHEN selected_aircraft LIKE '%787%' THEN 24 + FLOOR(RANDOM() * 16)::INTEGER -- 787: 24-40 seats
                        ELSE 15 + FLOOR(RANDOM() * 15)::INTEGER -- Default: 15-30 seats
                    END,
                    NOW(), 'daily_generator', NOW(), 'daily_generator', false
                );
            END IF;
            
            schedule_count := schedule_count + 1;
        END LOOP;
    END LOOP;
    
    RETURN schedule_count;
END;
$$;


ALTER FUNCTION public.generate_daily_flight_data(target_date date) OWNER TO postgres;

--
-- TOC entry 243 (class 1255 OID 57890)
-- Name: generate_flight_data_range(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_flight_data_range(start_date date, end_date date) RETURNS TABLE(date_generated date, schedules_created integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    current_target_date DATE := start_date;
    result_count INTEGER;
BEGIN
    WHILE current_target_date <= end_date LOOP
        SELECT generate_daily_flight_data(current_target_date) INTO result_count;
        
        date_generated := current_target_date;
        schedules_created := result_count;
        RETURN NEXT;
        
        current_target_date := current_target_date + INTERVAL '1 day';
    END LOOP;
END;
$$;


ALTER FUNCTION public.generate_flight_data_range(start_date date, end_date date) OWNER TO postgres;

--
-- TOC entry 244 (class 1255 OID 57891)
-- Name: get_flight_statistics(date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_flight_statistics(target_date date DEFAULT CURRENT_DATE) RETURNS TABLE(total_schedules integer, total_routes integer, avg_price_economy numeric, avg_price_business numeric, total_available_seats integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT fs.schedule_id)::INTEGER as total_schedules,
        COUNT(DISTINCT f.flight_id)::INTEGER as total_routes,
        ROUND(AVG(CASE WHEN ff.fare_class = 'ECONOMY' THEN ff.price END), 0) as avg_price_economy,
        ROUND(AVG(CASE WHEN ff.fare_class = 'BUSINESS' THEN ff.price END), 0) as avg_price_business,
        SUM(ff.available_seats)::INTEGER as total_available_seats
    FROM flight_schedules fs
    JOIN flights f ON fs.flight_id = f.flight_id
    JOIN flight_fares ff ON fs.schedule_id = ff.schedule_id
    WHERE DATE(fs.departure_time) = target_date;
END;
$$;


ALTER FUNCTION public.get_flight_statistics(target_date date) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 229 (class 1259 OID 58234)
-- Name: aircraft; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aircraft (
    aircraft_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    created_by character varying(255),
    updated_at timestamp without time zone NOT NULL,
    updated_by character varying(255),
    is_deleted boolean NOT NULL,
    deleted_at timestamp without time zone,
    deleted_by character varying(255),
    model character varying(100) NOT NULL,
    manufacturer character varying(100),
    capacity_economy integer,
    capacity_business integer,
    capacity_first integer,
    total_capacity integer,
    registration_number character varying(20),
    is_active boolean NOT NULL,
    featured_media_id bigint
);


ALTER TABLE public.aircraft OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 58233)
-- Name: aircraft_aircraft_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.aircraft ALTER COLUMN aircraft_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.aircraft_aircraft_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 217 (class 1259 OID 57892)
-- Name: airlines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.airlines (
    airline_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    created_by character varying(255),
    updated_at timestamp without time zone NOT NULL,
    updated_by character varying(255),
    is_deleted boolean NOT NULL,
    deleted_at timestamp without time zone,
    deleted_by character varying(255),
    name character varying(255) NOT NULL,
    iata_code character varying(2),
    is_active boolean NOT NULL,
    featured_media_id bigint
);


ALTER TABLE public.airlines OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 57897)
-- Name: airlines_airline_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.airlines ALTER COLUMN airline_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.airlines_airline_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 219 (class 1259 OID 57898)
-- Name: airports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.airports (
    airport_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    created_by character varying(255),
    updated_at timestamp without time zone NOT NULL,
    updated_by character varying(255),
    is_deleted boolean NOT NULL,
    deleted_at timestamp without time zone,
    deleted_by character varying(255),
    name character varying(255) NOT NULL,
    iata_code character varying(3) NOT NULL,
    city character varying(100),
    country character varying(100),
    is_active boolean NOT NULL,
    featured_media_id bigint,
    latitude double precision,
    longitude double precision
);


ALTER TABLE public.airports OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 57903)
-- Name: airports_airport_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.airports ALTER COLUMN airport_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.airports_airport_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 221 (class 1259 OID 57904)
-- Name: databasechangelog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.databasechangelog (
    id character varying(255) NOT NULL,
    author character varying(255) NOT NULL,
    filename character varying(255) NOT NULL,
    dateexecuted timestamp without time zone NOT NULL,
    orderexecuted integer NOT NULL,
    exectype character varying(10) NOT NULL,
    md5sum character varying(35),
    description character varying(255),
    comments character varying(255),
    tag character varying(255),
    liquibase character varying(20),
    contexts character varying(255),
    labels character varying(255),
    deployment_id character varying(10)
);


ALTER TABLE public.databasechangelog OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 57909)
-- Name: databasechangeloglock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.databasechangeloglock (
    id integer NOT NULL,
    locked boolean NOT NULL,
    lockgranted timestamp without time zone,
    lockedby character varying(255)
);


ALTER TABLE public.databasechangeloglock OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 57912)
-- Name: flight_fares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flight_fares (
    fare_id uuid NOT NULL,
    created_at timestamp without time zone NOT NULL,
    created_by character varying(255),
    updated_at timestamp without time zone NOT NULL,
    updated_by character varying(255),
    is_deleted boolean NOT NULL,
    deleted_at timestamp without time zone,
    deleted_by character varying(255),
    schedule_id uuid NOT NULL,
    fare_class character varying(255) NOT NULL,
    price numeric(10,2) NOT NULL,
    available_seats integer NOT NULL
);


ALTER TABLE public.flight_fares OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 58007)
-- Name: flight_outbox_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flight_outbox_events (
    id uuid NOT NULL,
    aggregate_type character varying(50) NOT NULL,
    aggregate_id character varying(100) NOT NULL,
    event_type character varying(100) NOT NULL,
    payload text,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public.flight_outbox_events OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 57925)
-- Name: flight_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flight_schedules (
    schedule_id uuid NOT NULL,
    created_at timestamp without time zone NOT NULL,
    created_by character varying(255),
    updated_at timestamp without time zone NOT NULL,
    updated_by character varying(255),
    is_deleted boolean NOT NULL,
    deleted_at timestamp without time zone,
    deleted_by character varying(255),
    flight_id bigint NOT NULL,
    departure_time timestamp without time zone NOT NULL,
    arrival_time timestamp without time zone NOT NULL,
    aircraft_type character varying(100),
    status character varying(50),
    aircraft_id bigint
);


ALTER TABLE public.flight_schedules OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 57930)
-- Name: flights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flights (
    flight_id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    created_by character varying(255),
    updated_at timestamp without time zone NOT NULL,
    updated_by character varying(255),
    is_deleted boolean NOT NULL,
    deleted_at timestamp without time zone,
    deleted_by character varying(255),
    flight_number character varying(20) NOT NULL,
    airline_id bigint NOT NULL,
    departure_airport_id bigint NOT NULL,
    arrival_airport_id bigint NOT NULL,
    base_duration_minutes integer,
    aircraft_type character varying(50),
    base_price numeric(10,2),
    is_active boolean NOT NULL,
    status character varying(20),
    aircraft_id bigint
);


ALTER TABLE public.flights OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 57935)
-- Name: flights_flight_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.flights ALTER COLUMN flight_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.flights_flight_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 3482 (class 0 OID 58234)
-- Dependencies: 229
-- Data for Name: aircraft; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aircraft (aircraft_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by, model, manufacturer, capacity_economy, capacity_business, capacity_first, total_capacity, registration_number, is_active, featured_media_id) FROM stdin;
1	2025-09-12 01:10:16.30703	1c544260-57c6-4e63-ba65-9a529f3783a2	2025-09-12 01:10:16.307081	1c544260-57c6-4e63-ba65-9a529f3783a2	f	\N	\N	fdf	wefew	5	4	4	8	vb-dsa	t	\N
2	2025-09-13 07:15:11.97464	system	2025-09-13 07:15:11.97464	system	f	\N	\N	A220	Airbus	120	20	10	150	VN-A220	t	\N
3	2025-09-13 07:15:11.97464	system	2025-09-13 07:15:11.97464	system	f	\N	\N	A320	Airbus	150	25	10	185	VN-A320	t	\N
4	2025-09-13 07:15:11.97464	system	2025-09-13 07:15:11.97464	system	f	\N	\N	A330	Airbus	250	35	15	300	VN-A330	t	\N
5	2025-09-13 07:15:11.97464	system	2025-09-13 07:15:11.97464	system	f	\N	\N	A350	Airbus	320	50	40	410	VN-A350	t	\N
6	2025-09-13 07:15:11.97464	system	2025-09-13 07:15:11.97464	system	f	\N	\N	A380	Airbus	450	80	60	590	VN-A380	t	\N
7	2025-09-13 07:15:11.97464	system	2025-09-13 07:15:11.97464	system	f	\N	\N	737	Boeing	150	40	25	215	VN-B737	t	\N
8	2025-09-13 07:15:11.97464	system	2025-09-13 07:15:11.97464	system	f	\N	\N	747	Boeing	400	80	44	524	VN-B747	t	\N
9	2025-09-13 07:15:11.97464	system	2025-09-13 07:15:11.97464	system	f	\N	\N	767	Boeing	250	80	45	375	VN-B767	t	\N
10	2025-09-13 07:15:11.97464	system	2025-09-13 07:15:11.97464	system	f	\N	\N	777	Boeing	320	60	60	440	VN-B777	t	\N
11	2025-09-13 07:15:11.97464	system	2025-09-13 07:15:11.97464	system	f	\N	\N	787	Boeing	250	50	30	330	VN-B787	t	\N
12	2025-09-13 07:15:11.97464	system	2025-09-13 07:15:11.97464	system	f	\N	\N	E195-E2	Embraer	120	20	6	146	VN-E195	t	\N
13	2025-09-13 07:15:11.97464	system	2025-09-13 07:15:11.97464	system	f	\N	\N	Phenom 300	Embraer	6	1	0	7	VN-P300	t	\N
14	2025-09-13 07:15:11.97464	system	2025-09-13 07:15:11.97464	system	f	\N	\N	C-390 Millennium	Embraer	70	0	0	70	VN-C390	t	\N
15	2025-09-13 07:18:51.29824	system	2025-09-13 07:18:51.29824	system	f	\N	\N	ATR 72	ATR	64	0	0	64	VN-ATR72	t	\N
\.


--
-- TOC entry 3470 (class 0 OID 57892)
-- Dependencies: 217
-- Data for Name: airlines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.airlines (airline_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by, name, iata_code, is_active, featured_media_id) FROM stdin;
1	2025-07-07 19:29:09.357694	system	2025-07-07 19:29:09.357694	system	f	\N	\N	Vietnam Airlines	VN	t	\N
2	2025-07-07 19:29:20.729471	system	2025-07-07 19:29:20.729471	system	f	\N	\N	VietJet Air	VJ	t	\N
3	2025-07-07 19:29:31.076864	system	2025-07-07 19:29:31.076864	system	f	\N	\N	Bamboo Airways	QH	t	\N
4	2025-07-07 19:29:43.252003	system	2025-07-07 19:29:43.252003	system	f	\N	\N	Pacific Airlines	BL	t	\N
\.


--
-- TOC entry 3472 (class 0 OID 57898)
-- Dependencies: 219
-- Data for Name: airports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.airports (airport_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by, name, iata_code, city, country, is_active, featured_media_id, latitude, longitude) FROM stdin;
1	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Côn Đảo	VCS	Côn Đảo	Vietnam	t	\N	\N	\N
2	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Phù Cát	UIH	Quy Nhon	Vietnam	t	\N	\N	\N
3	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Cà Mau	CAH	Cà Mau	Vietnam	t	\N	\N	\N
4	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Cần Thơ	VCA	Cần Thơ	Vietnam	t	\N	\N	\N
5	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Buôn Ma Thuột	BMV	Buôn Ma Thuột	Vietnam	t	\N	\N	\N
6	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Quốc tế Đà Nẵng	DAD	Đà Nẵng	Vietnam	t	\N	\N	\N
7	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Điện Biên Phủ	DIN	Điện Biên Phủ	Vietnam	t	\N	\N	\N
8	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Pleiku	PXU	Pleiku	Vietnam	t	\N	\N	\N
9	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Quốc tế Cát Bi	HPH	Hải Phòng	Vietnam	t	\N	\N	\N
10	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Quốc tế Nội Bài	HAN	Hà Nội	Vietnam	t	\N	\N	\N
11	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Quốc tế Tân Sơn Nhất	SGN	Thành phố Hồ Chí Minh	Vietnam	t	\N	\N	\N
12	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Quốc tế Cam Ranh	CXR	Nha Trang	Vietnam	t	\N	\N	\N
13	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Rạch Giá	VKG	Rạch Giá	Vietnam	t	\N	\N	\N
14	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Quốc tế Phú Quốc	PQC	Phú Quốc	Vietnam	t	\N	\N	\N
15	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Quốc tế Liên Khương	DLI	Đà Lạt	Vietnam	t	\N	\N	\N
16	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Vinh	VII	Vinh	Vietnam	t	\N	\N	\N
17	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Tuy Hòa	TBB	Tuy Hòa	Vietnam	t	\N	\N	\N
18	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Đồng Hới	VDH	Đồng Hới	Vietnam	t	\N	\N	\N
19	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Chu Lai	VCL	Tam Kỳ	Vietnam	t	\N	\N	\N
20	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Quốc tế Phú Bài	HUI	Huế	Vietnam	t	\N	\N	\N
21	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Thọ Xuân	THD	Thanh Hóa	Vietnam	t	\N	\N	\N
22	2025-07-07 19:31:48.900263	system	2025-07-07 19:31:48.900263	system	f	\N	\N	Sân bay Quốc tế Vân Đồn	VDO	Quảng Ninh	Vietnam	t	\N	\N	\N
\.


--
-- TOC entry 3474 (class 0 OID 57904)
-- Dependencies: 221
-- Data for Name: databasechangelog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.databasechangelog (id, author, filename, dateexecuted, orderexecuted, exectype, md5sum, description, comments, tag, liquibase, contexts, labels, deployment_id) FROM stdin;
1751915213284-1	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.226224	1	EXECUTED	9:296c27b067974fc46d4a504eb08ceb72	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-2	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.250334	2	EXECUTED	9:1b4d0b230ddf6034f3585ed5ed4a3dbe	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-3	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.27156	3	EXECUTED	9:4dbadc3234175a5df97d48862a029d5b	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-4	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.290943	4	EXECUTED	9:24d3ed9394303d7f10e2e14c89f71f2b	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-5	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.318989	5	EXECUTED	9:bd7b125ab7608916b8e240b413b26fa0	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-6	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.336746	6	EXECUTED	9:97c5b824128540eb7a19e6a01281d207	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-7	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.3567	7	EXECUTED	9:8f2d5f51319bb748f705e62aa94c33cc	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-8	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.374998	8	EXECUTED	9:f347a01d7e5467e605b0868cf3f9fd0c	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-9	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.390181	9	EXECUTED	9:9b972730e1545dd30248cf57b4e7b865	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-10	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.406613	10	EXECUTED	9:e165e1afef650f8f793868774d36717d	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-11	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.422585	11	EXECUTED	9:c75f321188e4a692426269bd15cbcd70	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-12	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.441854	12	EXECUTED	9:f647ba11881c3d7eb329ad0912007a6e	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-13	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.458253	13	EXECUTED	9:d0c7da50a3c679c60438f64086025519	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-14	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.475118	14	EXECUTED	9:5a0f684c2a10fe047dc0c764a766c24a	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-15	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.493119	15	EXECUTED	9:7443cbd1dc18ccac55eba72f38db0258	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-16	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.509714	16	EXECUTED	9:dbe1de357af4b8a50243e736efac1061	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-17	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.523982	17	EXECUTED	9:fe1cc458a4769b4e76bb3bdc0e684925	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-18	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.53957	18	EXECUTED	9:b51bb110531a6aec71b49bd0e16f34e5	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-19	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.555588	19	EXECUTED	9:714a0bbb614c26efd0f09d6b51b8bbf7	sql		\N	4.31.1	\N	\N	1915418607
1751915213284-20	PhamDuyHuy	db/changelog/ddl/001-create-flight-tables.sql	2025-07-07 19:10:19.569413	20	EXECUTED	9:dde1cb8e908e056e841cf9524bcc6761	sql		\N	4.31.1	\N	\N	1915418607
002-daily-flight-data-generator-1	PhamDuyHuy	db/changelog/ddl/002-daily-flight-data-generator.xml	2025-07-07 20:26:36.700225	21	EXECUTED	9:bc544682aef6397c3a391f07ed88708e	sql; createProcedure	Create function to generate daily flight schedules and fares for demo purposes	\N	4.31.1	\N	\N	1919995401
002-daily-flight-data-generator-2	PhamDuyHuy	db/changelog/ddl/002-daily-flight-data-generator.xml	2025-07-07 20:26:36.722249	22	EXECUTED	9:4a67af9b6361fc76b9af3823e1185352	sql; createProcedure	Create function to generate flight data for multiple days	\N	4.31.1	\N	\N	1919995401
002-daily-flight-data-generator-3	PhamDuyHuy	db/changelog/ddl/002-daily-flight-data-generator.xml	2025-07-07 20:26:36.742998	23	EXECUTED	9:98cac98382c749f97803389c3ceb4b76	sql; createProcedure	Create function to clean up old flight data	\N	4.31.1	\N	\N	1919995401
002-daily-flight-data-generator-4	PhamDuyHuy	db/changelog/ddl/002-daily-flight-data-generator.xml	2025-07-07 20:26:36.76357	24	EXECUTED	9:63541bdb6d3c4c3fde814ac801f6724a	sql; createProcedure	Create function to get flight statistics	\N	4.31.1	\N	\N	1919995401
raw	includeAll	db/changelog/ddl/functions/001-generate-daily-flight-data.sql	2025-07-07 20:26:36.786269	25	EXECUTED	9:71e22f1ec85ede5d9af92d3a6bf8bfe9	sql		\N	4.31.1	\N	\N	1919995401
raw	includeAll	db/changelog/ddl/functions/002-generate-flight-data-range.sql	2025-07-07 20:26:36.804295	26	EXECUTED	9:7b258226b0137ce78603fcd1a525c4a4	sql		\N	4.31.1	\N	\N	1919995401
raw	includeAll	db/changelog/ddl/functions/003-cleanup-old-flight-data.sql	2025-07-07 20:26:36.820836	27	EXECUTED	9:dd43dc4e273db3a128500a64601ab9e5	sql		\N	4.31.1	\N	\N	1919995401
raw	includeAll	db/changelog/ddl/functions/004-get-flight-statistics.sql	2025-07-07 20:26:36.834416	28	EXECUTED	9:12d664c780abeb359300fab4b1b9058c	sql		\N	4.31.1	\N	\N	1919995401
003-seed-flight-legs-data	PhamDuyHuy	db/changelog/ddl/003-seed-flight-legs-inventory.xml	2025-07-07 20:41:39.966311	29	EXECUTED	9:87f5f6e499918baf2c47618eb4798707	sql	Seed flight legs data for Vietnamese flights	\N	4.31.1	\N	\N	1920899276
003-seed-flight-inventory-data	PhamDuyHuy	db/changelog/ddl/003-seed-flight-legs-inventory.xml	2025-07-07 20:41:40.007472	30	EXECUTED	9:1729ae7227f3a99d023dbbdbbe74df78	sql	Seed flight inventory data for flight legs	\N	4.31.1	\N	\N	1920899276
1757194302776-1	PhamDuyHuy	db/changelog/ddl/004-02-08-changelog.sql	2025-09-08 19:20:04.623029	31	EXECUTED	9:0c59481bbda7fedb2d842d863e123dc2	sql		\N	4.31.1	\N	\N	7359197436
1757194302776-2	PhamDuyHuy	db/changelog/ddl/004-02-08-changelog.sql	2025-09-08 19:20:04.689754	32	EXECUTED	9:39bc7833a5ef158c8951e110b99817a3	sql		\N	4.31.1	\N	\N	7359197436
1757194302776-4	PhamDuyHuy	db/changelog/ddl/004-02-08-changelog.sql	2025-09-08 19:20:04.73443	33	EXECUTED	9:f02bdeaaa3b387e01c364928b5aa95cb	sql		\N	4.31.1	\N	\N	7359197436
1757194302776-5	PhamDuyHuy	db/changelog/ddl/004-02-08-changelog.sql	2025-09-08 19:20:04.776756	34	EXECUTED	9:d0f7edd9918436d62a021a5a2f65b6a1	sql		\N	4.31.1	\N	\N	7359197436
1757194302776-9	PhamDuyHuy	db/changelog/ddl/004-02-08-changelog.sql	2025-09-08 19:20:04.802889	35	EXECUTED	9:63b348cdba643561898812e2852897fe	sql		\N	4.31.1	\N	\N	7359197436
1757194302776-10	PhamDuyHuy	db/changelog/ddl/004-02-08-changelog.sql	2025-09-08 19:20:04.836486	36	EXECUTED	9:f7bbe1411ffca71d02d18cd5c6aefcd4	sql		\N	4.31.1	\N	\N	7359197436
1757194302776-11	PhamDuyHuy	db/changelog/ddl/004-02-08-changelog.sql	2025-09-08 19:20:04.861522	37	EXECUTED	9:000f8a023c0415d0fed93ded0c52d54a	sql		\N	4.31.1	\N	\N	7359197436
1757194302776-12	PhamDuyHuy	db/changelog/ddl/004-02-08-changelog.sql	2025-09-08 19:20:04.91525	38	EXECUTED	9:dc2ad220c0a608aeb2104b950c5f1a2b	sql		\N	4.31.1	\N	\N	7359197436
1757194302776-14	PhamDuyHuy	db/changelog/ddl/004-02-08-changelog.sql	2025-09-08 19:20:04.952839	39	EXECUTED	9:4962627447aa6db0e4ed062d9247baa0	sql		\N	4.31.1	\N	\N	7359197436
1757194302776-16	PhamDuyHuy	db/changelog/ddl/004-02-08-changelog.sql	2025-09-08 19:20:04.996379	40	EXECUTED	9:2a3d2d3611ef45a9da8cc25b90c31bf2	sql		\N	4.31.1	\N	\N	7359197436
1757194302776-19	PhamDuyHuy	db/changelog/ddl/004-02-08-changelog.sql	2025-09-08 19:20:05.021725	41	EXECUTED	9:52d2fd4b98e5eb5f4640436cc65754af	sql		\N	4.31.1	\N	\N	7359197436
1757194302776-21	PhamDuyHuy	db/changelog/ddl/004-02-08-changelog.sql	2025-09-08 19:20:05.057368	42	EXECUTED	9:2629a68c210324765538cc66d3b741c3	sql		\N	4.31.1	\N	\N	7359197436
1757194302776-22	PhamDuyHuy	db/changelog/ddl/004-02-08-changelog.sql	2025-09-08 19:20:05.084168	43	EXECUTED	9:e707914d0aadfc86aa70b581f5c87f2e	sql		\N	4.31.1	\N	\N	7359197436
1757194302776-23	PhamDuyHuy	db/changelog/ddl/004-02-08-changelog.sql	2025-09-08 19:20:05.124166	44	EXECUTED	9:1ba539931e664ac80a0c97893fc2b743	sql		\N	4.31.1	\N	\N	7359197436
1757194302776-24	PhamDuyHuy	db/changelog/ddl/004-02-08-changelog.sql	2025-09-08 19:20:05.194345	45	EXECUTED	9:c7946d4de5e74dabce8f7b5ee2922f7b	sql		\N	4.31.1	\N	\N	7359197436
1757357173749-19	PhamDuyHuy	db/changelog/ddl/005-changelog.sql	2025-09-08 19:20:05.236552	46	EXECUTED	9:f746bfbaf4c22d95403b270150fa6f7d	sql		\N	4.31.1	\N	\N	7359197436
1757357173749-20	PhamDuyHuy	db/changelog/ddl/005-changelog.sql	2025-09-08 19:20:05.266094	47	EXECUTED	9:7f06eaf389b7cb8682e852e5336fa384	sql		\N	4.31.1	\N	\N	7359197436
1757357173749-21	PhamDuyHuy	db/changelog/ddl/005-changelog.sql	2025-09-08 19:20:05.295073	48	EXECUTED	9:e57a37fd618c3b9cb5ec496410dc509a	sql		\N	4.31.1	\N	\N	7359197436
1757357173749-22	PhamDuyHuy	db/changelog/ddl/005-changelog.sql	2025-09-08 19:20:05.330272	49	EXECUTED	9:9c8fa33b578b20ccca62119902193e92	sql		\N	4.31.1	\N	\N	7359197436
1757359532976-2	PhamDuyHuy	db/changelog/ddl/005-changelog.sql	2025-09-08 19:26:34.469636	50	EXECUTED	9:fb8c44bef4ea79b8b43cdc478084a673	sql		\N	4.31.1	\N	\N	7359593210
1757359532976-3	PhamDuyHuy	db/changelog/ddl/005-changelog.sql	2025-09-08 19:26:34.493479	51	EXECUTED	9:1f5879ec4eebc33e7381e3d095af8c20	sql		\N	4.31.1	\N	\N	7359593210
1757359532976-8	PhamDuyHuy	db/changelog/ddl/005-changelog.sql	2025-09-08 19:26:34.522711	52	EXECUTED	9:e23a0b2ba61341ed362aef8221c5a297	sql		\N	4.31.1	\N	\N	7359593210
1757359532976-9	PhamDuyHuy	db/changelog/ddl/005-changelog.sql	2025-09-08 19:26:34.543834	53	EXECUTED	9:45949fb5bd85e8931e88704b553ed91e	sql		\N	4.31.1	\N	\N	7359593210
1757359532976-1	PhamDuyHuy	db/changelog/ddl/005-changelog.sql	2025-09-08 19:26:34.561573	54	EXECUTED	9:045fa6060992f2ed6aa3c51706022fe0	sql		\N	4.31.1	\N	\N	7359593210
1757504990159-2	PhamDuyHuy	db/changelog/ddl/006-changelog.sql	2025-09-10 11:53:45.276579	55	EXECUTED	9:ff562320c5011b9b73f222ae1164f045	sql		\N	4.31.1	\N	\N	7505218182
1757504990159-3	PhamDuyHuy	db/changelog/ddl/006-changelog.sql	2025-09-10 11:53:45.330883	56	EXECUTED	9:d134b23bd2f79d03fadcc3ce4739d7c6	sql		\N	4.31.1	\N	\N	7505218182
1757504990159-8	PhamDuyHuy	db/changelog/ddl/006-changelog.sql	2025-09-10 12:07:40.107184	57	EXECUTED	9:5b258d3d6dd9a738cd72e58399b275d7	sql		\N	4.31.1	\N	\N	7506052261
1757504990159-9	PhamDuyHuy	db/changelog/ddl/006-changelog.sql	2025-09-10 12:07:40.225349	58	EXECUTED	9:7c32a6a184a0b1b150ec4a5616b96d7e	sql		\N	4.31.1	\N	\N	7506052261
1757642337883-1	PhamDuyHuy	db/changelog/ddl/007-changelog.sql	2025-09-12 02:02:59.310679	59	EXECUTED	9:733e30b6f6defb46ee38ed55062fe584	sql		\N	4.31.1	\N	\N	7642572803
1757642337883-2	PhamDuyHuy	db/changelog/ddl/007-changelog.sql	2025-09-12 02:02:59.40462	60	EXECUTED	9:665fe24a1b6065a5fa8434406fa98adb	sql		\N	4.31.1	\N	\N	7642572803
\.


--
-- TOC entry 3475 (class 0 OID 57909)
-- Dependencies: 222
-- Data for Name: databasechangeloglock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.databasechangeloglock (id, locked, lockgranted, lockedby) FROM stdin;
1	f	\N	\N
\.


--
-- TOC entry 3476 (class 0 OID 57912)
-- Dependencies: 223
-- Data for Name: flight_fares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flight_fares (fare_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by, schedule_id, fare_class, price, available_seats) FROM stdin;
37a87112-4422-4731-b4d6-c7750800ae92	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	e4f210ef-9efb-423a-9d54-c6486d5d382b	ECONOMY	2528917.00	180
9d0deb03-29bb-446b-a1c7-a1e9970f862c	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	adad7f55-0ec0-49d1-81d3-161c5a0e4d69	ECONOMY	2698514.00	169
b8fb722a-b6d2-4997-a147-ec6cd579b593	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	4b4b74b6-f045-4b37-8440-6422a6e58ee4	ECONOMY	2912407.00	168
c4396d29-7a56-414a-8da7-425ab856c2e2	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	5cccf7cb-b195-461b-948c-23a53a2c685a	ECONOMY	2749439.00	154
8a4efa26-5c84-4dbf-a75d-01aa2af22309	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	7a80f891-8a3b-4e99-9776-0442fdf0bc59	ECONOMY	2653984.00	161
112cfd2b-8315-4c90-b5a2-28877b52768b	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	77a19ab7-725f-4788-80dc-1d994a76fbcb	ECONOMY	2540424.00	164
3184c2c8-425c-4827-ab57-4443c2d3ad1a	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	1c6cc922-d949-40e3-99a9-4ca761febf27	ECONOMY	2670069.00	164
8863854c-3a7d-4bba-86ab-f5d08c8ba21c	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	6055efcb-04a1-479a-b006-d5dd8fc35f6a	ECONOMY	2545490.00	162
c0e64ad9-c056-4c62-a7c1-0bd8edb42b3b	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	1ca90f29-8602-456e-bce0-55b0747643cf	ECONOMY	2692090.00	172
fe893d62-2fc6-4871-b3bc-c39350deb966	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	1b91aebc-c600-4733-b497-d4d09ca02712	ECONOMY	2904544.00	152
2f308e5b-e535-479c-9b87-3f81413fd23c	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	82056e4c-3629-457f-ae94-5415a1d118ec	ECONOMY	2549878.00	174
f7dd9496-71d3-43c8-bc7c-96da709512dc	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	ef983d3e-046e-417d-8fb2-e8390791d7d0	ECONOMY	2983180.00	159
2120d34b-7c2a-45ce-ac8c-304aed2e93ad	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	49d0251c-4146-422e-8dc0-f8b22fb9b3da	ECONOMY	2770718.00	158
9c782a13-1b47-4f97-874f-7fdf7706add8	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	2e74f69c-7b4f-47e0-bc31-a8aafab6cd65	ECONOMY	2950359.00	174
74ce1bf1-88f0-4118-9880-393784f0a25c	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	c3d6e2d6-9ed7-4e22-8581-b796e843ccbb	ECONOMY	2658742.00	157
fea2374c-afba-4a8a-b8ba-91b5f9d04df1	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	2cf40d1c-4641-454d-b2f0-d523e0f0a2d4	ECONOMY	2580707.00	168
00f74f28-e1df-4283-b60d-4694bbd9c943	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	e9f3cefd-d6d8-49d5-b5cf-8236592fcbf2	ECONOMY	2837017.00	173
4a78a491-afa5-477f-989c-f882fe5a1d28	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	5d468d28-569f-44df-8cea-02f28ea0b6b5	ECONOMY	2767838.00	153
eb4a7f97-4ede-4535-89cb-efe77baed1e5	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	4e679a44-24f9-43dc-a075-19805a1a0638	ECONOMY	2751049.00	159
36eb6258-0555-4b78-a391-ec233435747f	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	b708ce6f-51c0-4085-b75a-5b50f062ad60	ECONOMY	2648891.00	177
8c56d410-3619-4aee-9d22-62330ac2f252	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	d5d15872-bcef-4617-997e-4ef6e99729a3	ECONOMY	2691904.00	172
19ccfbfc-a321-4591-86c6-c24be8edf20b	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	5c6ae573-44bc-4814-965e-96fd20b9f876	ECONOMY	2712748.00	154
0d6e30d6-15ba-4d6c-97d2-d5110c748467	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	63c6ffed-4618-4fe8-a6e6-5cbf2772599c	ECONOMY	2618969.00	164
8246d0ad-a323-4c7b-a6d3-7f4ebaab31c1	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	2f64a3ce-8845-4055-8dc1-1ab2d8d21e3a	ECONOMY	2778939.00	163
9af1a33d-06f0-4826-a3cb-9c34297f758b	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	e4f210ef-9efb-423a-9d54-c6486d5d382b	BUSINESS	4619223.00	21
5341f417-5d71-4024-8aa2-d7b3748b1e79	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	adad7f55-0ec0-49d1-81d3-161c5a0e4d69	BUSINESS	5139387.00	22
20a50d7b-2190-4a9e-a022-3686c10375ad	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	4b4b74b6-f045-4b37-8440-6422a6e58ee4	BUSINESS	4990957.00	22
da589bee-ba6c-42e5-a1bc-2156df795c2e	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	5cccf7cb-b195-461b-948c-23a53a2c685a	BUSINESS	5127635.00	24
71ba0d98-1f93-4f62-bea4-1192f19ae425	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	7a80f891-8a3b-4e99-9776-0442fdf0bc59	BUSINESS	5211159.00	28
57806b7e-e80c-4c60-861b-05bf60ff4f41	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	77a19ab7-725f-4788-80dc-1d994a76fbcb	BUSINESS	5228949.00	26
010140aa-9a75-4134-8186-59536072bd66	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	1c6cc922-d949-40e3-99a9-4ca761febf27	BUSINESS	4881023.00	25
f6995db8-816c-4136-afbd-a876747e1c69	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	6055efcb-04a1-479a-b006-d5dd8fc35f6a	BUSINESS	4809531.00	23
e3cf1920-9ea8-4062-8eef-d0ae2f4e6c84	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	1ca90f29-8602-456e-bce0-55b0747643cf	BUSINESS	5093713.00	23
88b1e52e-84c5-4550-b839-75257ee06997	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	1b91aebc-c600-4733-b497-d4d09ca02712	BUSINESS	4891382.00	23
14b16dac-6931-40d4-8904-6ee4500ca6cd	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	82056e4c-3629-457f-ae94-5415a1d118ec	BUSINESS	4552181.00	25
33bf1de6-8e0e-49ed-ab79-38ad4f5e2192	2025-07-07 19:41:08.96929	system	2025-07-07 19:41:08.96929	system	f	\N	\N	ef983d3e-046e-417d-8fb2-e8390791d7d0	BUSINESS	5180941.00	28
a1ea9386-a15e-482c-8856-06748f1ec0cb	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	ecc7b2e6-c2b5-4216-afe2-990d6c351f5c	ECONOMY	2757288.00	153
9d847359-8304-4684-8bfb-843a8dbe2554	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	ecc7b2e6-c2b5-4216-afe2-990d6c351f5c	BUSINESS	5419546.00	26
33af7750-0e6e-458f-9284-eb94d8ed86ee	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	20a4264b-e01a-4c71-b20f-7c5e32bc4c3a	ECONOMY	2435898.00	164
5387d190-8f47-4098-be18-f9a789c3777a	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	20a4264b-e01a-4c71-b20f-7c5e32bc4c3a	BUSINESS	5905983.00	16
ef48326e-a096-42b8-a6be-bbf0641b27f2	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	2763bd08-da06-44ac-991f-d7cb53714ba9	ECONOMY	2400183.00	154
88500892-6edd-471b-8cb2-690779a22c98	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	2763bd08-da06-44ac-991f-d7cb53714ba9	BUSINESS	5237663.00	15
e0f1927b-e93d-4046-b114-6dd7208c1859	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	42d70ebb-60c5-4cc9-a600-dc21add03aed	ECONOMY	3044715.00	141
d3c5ccc7-44df-4296-a7f0-abfd003d2be0	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	42d70ebb-60c5-4cc9-a600-dc21add03aed	BUSINESS	5313488.00	19
2a7b9b48-3f14-4854-b0cc-26aaa00362d1	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	ce4d1ff6-de81-4b64-8987-b6c9c1bc5af9	ECONOMY	3287320.00	164
7bb801fa-a71c-44f6-bb0e-ee37a543da6a	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	ce4d1ff6-de81-4b64-8987-b6c9c1bc5af9	BUSINESS	4438187.00	18
d7a547b5-fcc3-4c09-b2c5-f2adbf634823	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	938c1617-fe18-4476-b38a-0b0d42392330	ECONOMY	2928292.00	64
a99388ee-8620-42c9-90ac-ea785ea835c4	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	90b80b0b-3e66-49c5-bd59-41de410dddef	ECONOMY	2707128.00	138
4ee0e893-6a5f-4629-b10c-a6a007ff29ad	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	90b80b0b-3e66-49c5-bd59-41de410dddef	BUSINESS	5333160.00	24
f8d66781-cb0a-4994-a1c9-39ffcf1fdfd4	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	f948a447-7432-45c2-884e-fafc93205991	ECONOMY	2211210.00	149
e4ebbec3-b123-46cc-a6a9-e7cfbdef14c3	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	f948a447-7432-45c2-884e-fafc93205991	BUSINESS	4668632.00	13
561f03eb-85b2-46c1-a58c-a46f3d731a88	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3f68b426-02a9-4e23-8dd9-f0e6f8d2a2d4	ECONOMY	2416039.00	194
0413c98a-aeb0-4b78-9af1-23b67d3ca102	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3f68b426-02a9-4e23-8dd9-f0e6f8d2a2d4	BUSINESS	6103516.00	16
64d6b88f-d5e2-4250-bd68-59e035d2fac5	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	c1b1f880-f44f-4201-bcaa-648a065720ea	ECONOMY	3208917.00	191
fbe78ea4-0ac5-4245-b1c1-5a2e2d0475ca	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	c1b1f880-f44f-4201-bcaa-648a065720ea	BUSINESS	6537437.00	26
c89fbcaf-2706-4b0e-9cb5-5228db3af2be	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	11d106a5-e190-4f46-8698-912f44057def	ECONOMY	2524474.00	57
deda655e-89c9-4a79-ad6c-f1fbe2b34886	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	398a69a9-fa2d-4b02-92f2-16af227fa9a9	ECONOMY	2893799.00	150
e98f793b-64ac-4f2a-a9c5-60f15dca64fe	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	398a69a9-fa2d-4b02-92f2-16af227fa9a9	BUSINESS	5963701.00	28
5adb349b-3e6c-48ea-891c-c665b057261a	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	0f42ba73-5e08-45d1-b1fc-54ce2d52eaee	ECONOMY	2706458.00	198
a82576d3-cd31-4956-9e23-516d6c0aead0	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	0f42ba73-5e08-45d1-b1fc-54ce2d52eaee	BUSINESS	5441294.00	17
638925da-53b5-4318-9894-8a27af601fcc	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	92a3d43d-2386-4e09-bd4d-69b06b35b1ab	ECONOMY	2780987.00	142
82064c68-0bd3-47b9-95b8-aabc18426a14	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	92a3d43d-2386-4e09-bd4d-69b06b35b1ab	BUSINESS	5204766.00	25
a4238996-53c4-414c-a419-df21acab30f0	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	005a4468-f7fc-40e5-ad65-3a96a3d5aa2f	ECONOMY	2166549.00	152
79cdd231-a2cd-447a-9c9a-18e67d7761a4	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	005a4468-f7fc-40e5-ad65-3a96a3d5aa2f	BUSINESS	4062737.00	15
cbe750fe-a465-4275-abf4-40873e3b8a1f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	ed43a18d-694a-4393-9d4b-a53d2e381e8f	ECONOMY	2570373.00	164
d8a29807-eb7c-4f54-8f73-553ceb37ade8	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	ed43a18d-694a-4393-9d4b-a53d2e381e8f	BUSINESS	4012344.00	16
46ff4000-3218-4558-bc25-0d2b989afcb5	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	f20f9903-cc83-4d1f-b2f6-fd0036fd388d	ECONOMY	2079628.00	152
8cac599b-356a-4111-8b2c-f8a8a38a2bdc	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	f20f9903-cc83-4d1f-b2f6-fd0036fd388d	BUSINESS	4136867.00	21
76418ef5-56be-47d3-b775-9539cc4ddbe6	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	02409b35-85b0-4390-b741-a5e7c083cca0	ECONOMY	2811045.00	234
183593ee-8c1f-4ff7-ae5a-87ec13b8c1d1	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	02409b35-85b0-4390-b741-a5e7c083cca0	BUSINESS	5372609.00	35
a4dbf1c8-d03d-47ac-b5bb-c800b550c91e	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	c4daf735-64ed-4c92-ae43-5199b23f1937	ECONOMY	2653017.00	174
3c7e304b-23d2-4033-8892-fcb6a2315975	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	c4daf735-64ed-4c92-ae43-5199b23f1937	BUSINESS	5447148.00	16
4089b2fd-9102-4d1a-b41b-89e7d30ca30d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	a0b9cb27-5808-49ae-9a54-1b67af343efd	ECONOMY	2407423.00	157
e077f4e1-45ff-4ff6-9727-071bbdd3157d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	a0b9cb27-5808-49ae-9a54-1b67af343efd	BUSINESS	4779134.00	16
6b2589a5-3949-4bc8-8a4a-f944d49f09d9	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	966c4151-61a5-4d69-8b6c-419d7fcf04de	ECONOMY	2912474.00	206
74d4d95a-7ce0-43ea-a9a8-719a6a0e5ab8	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	966c4151-61a5-4d69-8b6c-419d7fcf04de	BUSINESS	6091449.00	30
e227ff07-7bcc-4370-880e-64f5bbff82d7	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	0fa90bb5-4626-40cf-8b7f-18e282591a72	ECONOMY	2521317.00	169
af8af793-e427-41ff-908c-a199976a491d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	0fa90bb5-4626-40cf-8b7f-18e282591a72	BUSINESS	4345202.00	18
9368f330-614f-4471-b187-47435458117a	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	ece1ee84-9742-4cf1-a6b1-4535d656b391	ECONOMY	2957150.00	195
547f7e3a-73a0-4638-91df-598792b240a4	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	ece1ee84-9742-4cf1-a6b1-4535d656b391	BUSINESS	5167595.00	18
0a67db45-f791-4103-9b75-fb1e128e3ea1	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	c8fd95f9-8991-4235-bb78-94c91706f15f	ECONOMY	2402528.00	173
13b15b9f-2783-4ab6-b81c-435abae8799c	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	c8fd95f9-8991-4235-bb78-94c91706f15f	BUSINESS	4844700.00	19
f91250ab-0246-44cc-bf37-0dcf5272d7b0	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	7424d1f8-f301-4382-bea7-7bac4a3261ea	ECONOMY	2260124.00	155
4a0e8a7d-fafe-4d23-8bd2-a284fff2871d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	7424d1f8-f301-4382-bea7-7bac4a3261ea	BUSINESS	4191442.00	16
b64e3e73-9418-4b3f-a15c-a1189833a485	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	b7486473-79e5-4032-ab15-71174e5a3fe7	ECONOMY	1910066.00	170
3a8b573d-9878-46ba-a646-c4c0570a10e3	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	b7486473-79e5-4032-ab15-71174e5a3fe7	BUSINESS	2969175.00	28
841a9631-e414-4cee-b9c6-96a2f0412fc9	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	2f55bee2-71a7-42bd-8ceb-6bf3f3f69c6c	ECONOMY	1997037.00	169
1228a204-b963-4302-bae3-48c97830a086	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	2f55bee2-71a7-42bd-8ceb-6bf3f3f69c6c	BUSINESS	3829374.00	15
4a004c95-4f43-4457-b6b3-d7e14950b7dd	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3992a8b5-f2e0-40f8-b1a2-ef16b5094735	ECONOMY	2024935.00	50
ba3e8e06-86d8-4846-8bf3-f1411cd7bbc3	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	b5ad7e03-9b1c-4819-9d79-51ec91b3354b	ECONOMY	1477038.00	165
3670e1c1-8f65-4753-9e75-636c72b98b25	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	b5ad7e03-9b1c-4819-9d79-51ec91b3354b	BUSINESS	4366895.00	23
ea761049-9df4-43fd-b43d-efe9cc9a8b44	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	ab406ce9-3429-4c75-b8e7-06c86883eb87	ECONOMY	1697876.00	225
4fa0d817-83bb-4928-aedf-435aa34f19d6	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	ab406ce9-3429-4c75-b8e7-06c86883eb87	BUSINESS	3837849.00	28
dd968e63-6be9-4763-b3da-8dc31ba4db04	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	a3dc31b0-dfbb-4fb8-9716-8deb55f8e406	ECONOMY	1482694.00	192
1d1c38b7-ce44-4d71-a492-82a88a8dbf8a	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	a3dc31b0-dfbb-4fb8-9716-8deb55f8e406	BUSINESS	3826890.00	26
f9b2ff7d-307b-4ec3-b310-be79eb4c0812	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	97f11e2f-6368-4b15-810b-7631d0b9b254	ECONOMY	1653384.00	172
6238d42c-1132-4f66-9572-feed5b60a94e	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	97f11e2f-6368-4b15-810b-7631d0b9b254	BUSINESS	3991026.00	13
45aecb95-22e8-46a0-92e4-5d15ee6c5a3c	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	14eb39d7-65d4-4047-acca-737a8809cbbd	ECONOMY	1254149.00	69
560f4155-ac52-4585-94d9-7490d2b85e1d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	a0f97612-6cc6-4d5f-a22a-4c6a59e9418f	ECONOMY	1318189.00	221
9bf26267-893d-42ab-8c7b-8c296f9c561f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	a0f97612-6cc6-4d5f-a22a-4c6a59e9418f	BUSINESS	3276759.00	38
8455aaa8-adde-4067-b893-444579675140	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	a55dd98b-3dee-4564-b01d-2633fe17d16b	ECONOMY	1471875.00	141
3d960c6d-d0d2-4d13-bd22-11f7c95f09a0	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	a55dd98b-3dee-4564-b01d-2633fe17d16b	BUSINESS	4412124.00	16
29fc3df3-875d-43bb-b92e-0d344526fb09	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	c55b26ef-d669-424a-b94a-2d2c45fcba83	ECONOMY	1649023.00	158
b439fbd4-5ad1-467d-95c2-000c8726e7e4	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	c55b26ef-d669-424a-b94a-2d2c45fcba83	BUSINESS	3587318.00	19
30ee303d-02da-4794-9f09-94f416b872ba	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	a8d07188-1943-4e4d-86af-b665e9c99992	ECONOMY	2060573.00	190
34f3eac1-5a85-48a0-9e7b-8b4f5980652f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	a8d07188-1943-4e4d-86af-b665e9c99992	BUSINESS	3653170.00	20
2064b7d3-5566-41a4-823b-463939f50de8	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	554d5272-e0de-459a-8635-fb7beb649c7e	ECONOMY	1459863.00	60
1b55edac-ba13-4c19-8816-0f2b45704491	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	a16ab419-04b9-4432-b091-b00f6ba52d3c	ECONOMY	1724974.00	152
ee5586ba-bb64-4844-8bef-81ed66593d7f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	a16ab419-04b9-4432-b091-b00f6ba52d3c	BUSINESS	4155579.00	13
d41f0d52-a556-4db1-8807-80db368b7b52	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	63f823b1-528a-4939-aa23-425ff961b5f4	ECONOMY	2259126.00	187
002eb96d-1835-46f8-acf6-efef851c5057	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	63f823b1-528a-4939-aa23-425ff961b5f4	BUSINESS	3443574.00	24
3646b22a-fd5f-4ca5-874c-45f85bc90960	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3801074f-a471-4c48-b64b-0c0fbd7e3d3c	ECONOMY	1502835.00	152
cc6d7f9a-bb42-4c08-a659-61ce4e87aae4	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3801074f-a471-4c48-b64b-0c0fbd7e3d3c	BUSINESS	3007953.00	27
71ef2323-d966-441c-ba50-ffd9b22b9f39	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	10c67887-efe1-4c3a-bbfe-a07fa63498b0	ECONOMY	1467741.00	225
ea086806-1f41-4ec3-bb73-54664326ad19	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	10c67887-efe1-4c3a-bbfe-a07fa63498b0	BUSINESS	3796869.00	26
1fde3e5b-1f56-433a-888a-854da47c7af6	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	88a865ea-ccc5-4355-8816-9ef885b0ee5a	ECONOMY	1277232.00	52
c46e2917-e176-40a4-85df-0a2ff386f5b1	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	02af0e3c-a43e-499c-bdd7-6769c504f5b3	ECONOMY	1324048.00	225
9a379bd0-c6cc-4601-bbdf-474057caff4a	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	02af0e3c-a43e-499c-bdd7-6769c504f5b3	BUSINESS	3813773.00	25
8f81bd63-4688-45cb-ba3a-e173f3a353a4	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	955d8d47-4933-42d9-b21b-beedee8a637d	ECONOMY	1564750.00	120
9c7a6c9a-8369-4b72-8c8f-7d639209189e	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	955d8d47-4933-42d9-b21b-beedee8a637d	BUSINESS	3047563.00	26
5b4d7966-ebea-43c7-aab5-638f6fec5c87	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	85ca5942-2f11-444a-a7b4-e3e68d200b82	ECONOMY	2025829.00	188
f8df2f79-8d31-405b-8b42-d4ccf926cabc	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	85ca5942-2f11-444a-a7b4-e3e68d200b82	BUSINESS	4465572.00	23
a290ffa9-3d52-4f15-a659-5e9d4beeea38	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	f38f4169-5f81-43eb-b447-98da3bb2646c	ECONOMY	1768781.00	126
602cabcb-2175-4727-b32a-68fbd3c91467	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	f38f4169-5f81-43eb-b447-98da3bb2646c	BUSINESS	3786540.00	20
1e0e10d6-3014-4e04-9b29-0977ccec3870	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	4dceccad-bf0a-4e4a-9431-01dd266f8471	ECONOMY	1293508.00	134
b261328b-f15c-4217-a2e7-d0f2feb7fa1c	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	4dceccad-bf0a-4e4a-9431-01dd266f8471	BUSINESS	3307623.00	28
3d1f5cdc-e129-45d1-a19e-8c52ea1611ca	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	b3e02a8b-f1d4-4844-97f1-b474de4d4982	ECONOMY	1425705.00	170
57c7a54c-15b3-43e9-b16e-a745565b0459	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	b3e02a8b-f1d4-4844-97f1-b474de4d4982	BUSINESS	3409796.00	16
ea1b1165-0c93-451d-9a6a-7deb35cdc8b0	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	5550a83a-f517-486e-b2b0-7c178717541b	ECONOMY	1371403.00	69
d7416510-1951-44b4-b949-8aeed769ae3d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	c6cebf3b-85a0-46bc-bc41-5dde9aef2829	ECONOMY	1631019.00	146
b5cef5e7-3e67-4429-a6a7-16db531aba00	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	c6cebf3b-85a0-46bc-bc41-5dde9aef2829	BUSINESS	3380388.00	16
ee9c58f8-4248-4811-b3d3-3a253cbecf69	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	79118f98-97ec-48ab-aaf4-3da21d95208b	ECONOMY	2204261.00	203
761283cc-bb15-45f1-939c-d72507a8fca8	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	79118f98-97ec-48ab-aaf4-3da21d95208b	BUSINESS	5155527.00	31
e4fdffee-baba-4c42-aab2-1373f9b5ff76	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	73992b2f-fc0f-4c32-88c2-2e8f64478fc3	ECONOMY	2229591.00	66
93ed2aea-ea8f-4d5c-8d1b-037d8ea29af3	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	500b93f7-f254-4f29-b6aa-ef9d46f29717	ECONOMY	2238150.00	131
e5e2d733-9842-417c-8bb8-f24f5b797911	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	500b93f7-f254-4f29-b6aa-ef9d46f29717	BUSINESS	5323677.00	16
f9179189-baa7-4a57-89e7-9170b78f641f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	929516a7-c810-4454-8c86-809dbec00d1b	ECONOMY	2288902.00	189
8f27118d-916c-4418-9b16-44be0a0a8091	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	929516a7-c810-4454-8c86-809dbec00d1b	BUSINESS	4425046.00	17
34dfbe6a-6ee2-4e03-b550-2741cf0e4c1f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	fd3cd8c7-60d6-4100-9e80-862e6528edab	ECONOMY	2343196.00	171
73656e23-3026-4f10-b483-a8d247e029d0	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	fd3cd8c7-60d6-4100-9e80-862e6528edab	BUSINESS	4563150.00	12
3084b812-8842-48a3-9459-8835516d5fe8	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	8f2c94af-0288-403c-b8d7-b0632ea5ca49	ECONOMY	2492324.00	194
75500fb6-7cdf-40ac-9f63-2817e7f14366	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	8f2c94af-0288-403c-b8d7-b0632ea5ca49	BUSINESS	3817328.00	25
454a7cd1-c53b-47ea-bee9-7c08a61ee9d9	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	cda485ab-776f-44b5-9013-270d92220bee	ECONOMY	2604478.00	176
9fd073dc-6a23-4975-a395-98aa0c45e6ab	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	cda485ab-776f-44b5-9013-270d92220bee	BUSINESS	4358892.00	27
3a3a3cce-af55-47d6-b2ca-061763535fb6	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	fb76cfac-27c0-486b-a13d-9c45a2dc8e12	ECONOMY	1747146.00	52
c833d907-2f82-4bd5-a210-380ac31f0deb	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	0c62c40c-c8cf-4f8a-986c-cf8c901a1028	ECONOMY	2250552.00	123
cab28aa9-2153-4fc7-a993-349cf70c8318	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	0c62c40c-c8cf-4f8a-986c-cf8c901a1028	BUSINESS	4407207.00	26
1eea8adb-602c-42a1-889b-18dfb89d0c0f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	c99b523a-47d7-4e61-b923-75ae6bc67681	ECONOMY	2585653.00	194
31227d5d-73d5-4c06-bca8-c942799b5b97	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	c99b523a-47d7-4e61-b923-75ae6bc67681	BUSINESS	5002608.00	23
bd0f1cb3-bc20-4d37-af6b-36dd6395cb8b	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	8c04a7a0-44da-4f25-a810-945db370538e	ECONOMY	1749629.00	141
936a1081-efa6-4db2-8113-967b5ee69081	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	8c04a7a0-44da-4f25-a810-945db370538e	BUSINESS	3758364.00	29
8e2ac8ec-285a-4414-a707-cd7f9dd3dde4	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	e09f9b5b-626a-4042-a221-64771666a8c3	ECONOMY	2739110.00	170
3f87278e-e884-411f-99c9-d89b2374af24	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	e09f9b5b-626a-4042-a221-64771666a8c3	BUSINESS	4918537.00	24
2b8a12b3-0342-4440-8102-a1d3f1c9abaa	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	ffa4a5e4-888f-4fef-9caa-a630385571f6	ECONOMY	2092232.00	172
c6c1ffd4-f8d7-43e4-95fa-3ab54bea997f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	ffa4a5e4-888f-4fef-9caa-a630385571f6	BUSINESS	5105218.00	22
c3d26a9b-741e-474e-b4dc-79fc6e8bef00	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	5f96fc34-97d2-4384-a8e1-fdcf86a5146f	ECONOMY	2516080.00	187
a410c75f-2b91-4b71-9de6-4d2c60ab3adb	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	5f96fc34-97d2-4384-a8e1-fdcf86a5146f	BUSINESS	5292044.00	20
bca15ee5-755e-4a71-97b3-eb71b7325071	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	7bbdecd3-15ae-4459-98d2-09a8172d216d	ECONOMY	1698444.00	204
2b57d4f6-57ac-4523-ba04-3776bf526df1	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	7bbdecd3-15ae-4459-98d2-09a8172d216d	BUSINESS	4255703.00	38
c59267c7-7eeb-4168-a91a-4302b0f1938d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	49d10777-68c7-45f9-bead-f3b97b4f4a56	ECONOMY	2414615.00	67
837a9bcb-b9d2-4ca0-8aa3-7dce9de1be58	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	1472db3f-a792-4b41-adb6-65b4430d7aa4	ECONOMY	2094474.00	174
2b94dc50-9f8d-4a74-8183-397a630117bb	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	1472db3f-a792-4b41-adb6-65b4430d7aa4	BUSINESS	4602142.00	24
db65dfda-4c56-46fc-9a0b-b232f673e59f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	8e519efa-ba53-480f-880a-e0e74fdf3719	ECONOMY	2484228.00	187
c79458c1-e66e-4c08-b501-9ceb55bca009	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	8e519efa-ba53-480f-880a-e0e74fdf3719	BUSINESS	4947316.00	18
a2680ef7-f6e2-45d4-84ac-f3e372b37172	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	b3556b8d-ec25-4b51-898a-2e8e4b27a65d	ECONOMY	2465542.00	179
598cc447-8881-484e-af24-e3fe93ffc299	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	b3556b8d-ec25-4b51-898a-2e8e4b27a65d	BUSINESS	4319337.00	28
dc1cd853-0c75-4c8a-9cba-684f98ecd2e2	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	c6d64358-d9fb-4c43-bbf7-02ace8e47641	ECONOMY	2663918.00	64
7d4952f0-3b41-4187-8ecc-e5d51e3aaba2	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	7782c705-b954-4adf-939d-141383b8b9b7	ECONOMY	2505187.00	214
c4c06df1-73d4-483a-9f7f-722bbff85cc9	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	7782c705-b954-4adf-939d-141383b8b9b7	BUSINESS	5381503.00	38
cd0dc059-513c-4d1f-8893-7c606b7e071c	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	1b60e5ee-bdc5-4d07-b0e7-e90b79a62cec	ECONOMY	2667266.00	67
ee700d8f-4016-4807-9144-a43998841422	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	c6f06c58-1326-4014-910e-7e6df6d1ae3b	ECONOMY	3205285.00	65
fc11bf69-ce67-438f-b6da-00aa0f53ec1f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3e93920a-8ace-49c0-9297-d6236ecf51b3	ECONOMY	2472820.00	120
d83b3507-b7b7-4a4d-8779-2f51656a2926	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3e93920a-8ace-49c0-9297-d6236ecf51b3	BUSINESS	5251921.00	17
89324471-14b9-4460-9152-e21c0aecd8b6	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	c2be45aa-9ff4-44a8-8b2e-c99101b92979	ECONOMY	2835789.00	186
18d61630-6f22-4b9d-b323-38e7eaed67ae	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	c2be45aa-9ff4-44a8-8b2e-c99101b92979	BUSINESS	4427464.00	24
1f410f52-80ac-4875-92ac-17908de2ed70	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	7c27f899-f9f5-46ba-bda8-5c9d83a8ba21	ECONOMY	3258981.00	165
096e422d-ce13-4ca5-9eb1-cfe5e249438c	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	7c27f899-f9f5-46ba-bda8-5c9d83a8ba21	BUSINESS	6196862.00	20
b0395822-3c3d-46ba-99cb-4c811538e7f6	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3e582e7d-e5cd-4bbd-ade7-69e3c9bf7d64	ECONOMY	2482065.00	167
ca15e594-723b-497c-9500-f299ef2b60d6	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3e582e7d-e5cd-4bbd-ade7-69e3c9bf7d64	BUSINESS	4491774.00	23
bb99aad2-9aee-4e28-9566-a3cb62b58206	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	f34e8fc1-05ea-490c-a660-308313859843	ECONOMY	2444176.00	56
ff68e7e3-b663-4dde-8ae7-83c1a5256ad0	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	21e69093-f2ed-4af3-90aa-22edf3213a78	ECONOMY	3013061.00	153
8d7de2bb-5333-44b0-a0f8-473dde041595	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	21e69093-f2ed-4af3-90aa-22edf3213a78	BUSINESS	6103397.00	12
71d8cc68-ace7-40b5-948c-f6cfa7b60b59	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	61b34db3-fb39-4d5d-a998-b74d4c55ccae	ECONOMY	2416453.00	197
31525703-a93b-4243-8d2f-cbf5adf678e0	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	61b34db3-fb39-4d5d-a998-b74d4c55ccae	BUSINESS	5419003.00	16
4063d42a-4f75-478a-8562-26695c96cab3	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	e3655339-1473-4de7-80be-32435a755f9b	ECONOMY	2890469.00	53
852d8ec2-dadf-46b7-b49b-0668c0a37d32	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	878b66dc-223f-43de-a34d-f23aa35caf1a	ECONOMY	2637080.00	189
3e2dde23-2a2d-4951-bce3-635218f1a1a2	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	878b66dc-223f-43de-a34d-f23aa35caf1a	BUSINESS	4705760.00	23
9425decb-ba18-4ca6-a81b-4998759e3169	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	19f6a6f0-971f-454f-b79e-7edd706b2b9e	ECONOMY	2865955.00	139
34fcc3a3-6efb-4743-b94d-83de7012f92e	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	19f6a6f0-971f-454f-b79e-7edd706b2b9e	BUSINESS	5703238.00	22
9ff3b177-56ee-4597-9944-8b8b135e9973	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	7eb0d9e9-d8a7-4d03-b0ea-6558e070a989	ECONOMY	2847030.00	228
0e1917f8-5fcd-4e9e-8902-89ce3363bcb2	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	7eb0d9e9-d8a7-4d03-b0ea-6558e070a989	BUSINESS	4901384.00	32
71b5d02c-8310-4373-ad45-c3759fc7f801	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	b19b82d8-a815-49d4-87c4-d47d967237b8	ECONOMY	2848980.00	160
063a51b7-658d-45cd-9ebc-12e45ab2e184	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	b19b82d8-a815-49d4-87c4-d47d967237b8	BUSINESS	5034063.00	15
a5fb9d0f-6204-44e6-b224-55320c205e04	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	a8e3411d-c341-4de4-85f2-20634c2c6cad	ECONOMY	2116305.00	162
a0ff848e-5ba3-4141-aeaa-bc051342b52e	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	a8e3411d-c341-4de4-85f2-20634c2c6cad	BUSINESS	4212740.00	22
046a280c-1b70-4c46-9689-36f620da8f1a	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	735d5c36-f4d1-4b2d-a652-6335f365a593	ECONOMY	2833403.00	202
71ecad47-500a-4de0-85bd-ab3cb78c51bf	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	735d5c36-f4d1-4b2d-a652-6335f365a593	BUSINESS	5439105.00	24
72be73ef-470b-40ec-9e41-2888cfbf439c	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	ba348e0b-7aa5-46c9-8e3e-616a42444957	ECONOMY	2467055.00	168
ae871c46-cb8a-4ae8-b39a-61fff361f285	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	ba348e0b-7aa5-46c9-8e3e-616a42444957	BUSINESS	6560876.00	21
94c5afc4-696b-463b-8f68-14bda344f386	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	952b405c-39fd-4d4c-a2da-7946ed82c182	ECONOMY	2599436.00	231
8b3da662-5d91-42de-9867-a93a3b718492	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	952b405c-39fd-4d4c-a2da-7946ed82c182	BUSINESS	5197198.00	29
f4d07a2a-9bb6-48aa-bcd9-19a659db733b	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	4b83e5cb-dd14-42ac-9d8b-68d06969cad1	ECONOMY	3336655.00	176
83336c8c-2e3e-4c41-b6e5-4e0973d2a89f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	4b83e5cb-dd14-42ac-9d8b-68d06969cad1	BUSINESS	5672435.00	29
eeef06ba-a700-4838-ac3b-f3fe691c9b36	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3dc53ebf-2ac8-41d5-836c-fe75c2ce63f6	ECONOMY	3458535.00	167
87a86773-0046-4971-93a0-4ded0436c2db	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3dc53ebf-2ac8-41d5-836c-fe75c2ce63f6	BUSINESS	6178095.00	24
99def74c-3919-4fab-b575-a153c53caaad	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	97c994bb-d174-44e9-bc2d-587200f4f5f8	ECONOMY	3316608.00	143
666090c2-5590-4ac5-9568-de840d8c661e	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	97c994bb-d174-44e9-bc2d-587200f4f5f8	BUSINESS	5455607.00	14
7a17a0e2-abc5-444f-a91f-e1e4fdf275f5	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	fd375409-fc2d-4282-814b-13ca90677827	ECONOMY	2144573.00	170
fb75bced-2a0d-4831-a428-aeeea7ffb185	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	fd375409-fc2d-4282-814b-13ca90677827	BUSINESS	4342873.00	17
1fe250a9-c640-49ef-99bd-6572548137f2	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	8d05609d-ac22-493a-bdaa-f089cfd91660	ECONOMY	3252254.00	197
cc271a04-72c1-4caf-96a9-34d4be009960	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	8d05609d-ac22-493a-bdaa-f089cfd91660	BUSINESS	5456592.00	24
4bb7b945-7b45-4470-b458-a009bc95a49d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	39628ab0-be84-4e8e-8014-3114fbf41e7e	ECONOMY	3175068.00	130
696bb4af-ead6-40ba-9239-42d2cc34f92e	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	39628ab0-be84-4e8e-8014-3114fbf41e7e	BUSINESS	5268118.00	16
d85cc7a7-8f27-41ee-b0ab-e53d13d74eb1	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	ecb48cbe-14b1-4aba-b66a-6b74ff1eeb38	ECONOMY	2302296.00	155
3cb2c212-5af7-4fc6-b9be-c3cc4591da63	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	ecb48cbe-14b1-4aba-b66a-6b74ff1eeb38	BUSINESS	4912962.00	29
64d27714-3ed7-4506-8579-9336f14fa13c	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	34d40499-60ec-4a68-95fa-966382d55652	ECONOMY	2378535.00	59
dd86ee61-8d11-4ac1-abdb-76c4e8e7c2f3	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3238cc7c-d2c7-4121-932f-be3b7ef810ac	ECONOMY	2282838.00	168
7298fdb3-d715-4f00-996b-7b13475a7233	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3238cc7c-d2c7-4121-932f-be3b7ef810ac	BUSINESS	4591939.00	13
a277dfe3-6954-4215-914e-f23988c621f9	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	477cf0a6-efcb-43e5-9d12-670d6ede39e9	ECONOMY	2937084.00	120
661ab038-7ad3-4575-9ef9-593489d8be82	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	477cf0a6-efcb-43e5-9d12-670d6ede39e9	BUSINESS	6395748.00	15
f5097601-4fcf-4837-9a74-478d426d208e	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	8a47b4b6-2463-42f2-ab1b-7e33095f699e	ECONOMY	1833550.00	61
b050c912-5245-49b6-89e0-de6ace912e42	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	7cdde664-6770-4032-aec5-1d762529dc2e	ECONOMY	1696392.00	206
c00e76b2-91b7-4022-9c95-38240e1533c9	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	7cdde664-6770-4032-aec5-1d762529dc2e	BUSINESS	3282491.00	38
90f81474-774a-4df6-b9f8-a398ca7f388d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	ca4aed3a-50ef-4dcc-83bd-fb97b11a5846	ECONOMY	1369594.00	146
2ee0a3d5-2543-40c1-9995-9b702bfd3d57	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	ca4aed3a-50ef-4dcc-83bd-fb97b11a5846	BUSINESS	3777807.00	15
c81bb385-717b-4824-bae1-ade1d046a88d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	61b244af-be47-4aa5-84ce-7f97e1a7e221	ECONOMY	2333739.00	142
4b9522af-7558-46c4-9488-61d5933876bc	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	61b244af-be47-4aa5-84ce-7f97e1a7e221	BUSINESS	4108319.00	16
177199f7-c12f-4753-8363-da23851f50f1	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	32332605-d190-4ced-9e94-8fb5d1d86c6c	ECONOMY	1730938.00	166
73381ab8-0cdc-44c4-a16e-cf93b654b33f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	32332605-d190-4ced-9e94-8fb5d1d86c6c	BUSINESS	4279547.00	16
9a0809e2-0326-406d-96e5-bb3e1086c8b5	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	4bc4ff17-bb49-45f7-b21c-2096a72a1c06	ECONOMY	1437791.00	169
91f942ea-497f-4e4f-9a88-bd4c263ed0f2	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	4bc4ff17-bb49-45f7-b21c-2096a72a1c06	BUSINESS	2962619.00	19
ade59605-919a-40c5-8d7d-6266e0aa902c	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	2ceeb534-4c66-400b-a6a7-c6c8633fa9ce	ECONOMY	1440565.00	245
ca384be0-0dd2-4d2c-9493-159175a5b241	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	2ceeb534-4c66-400b-a6a7-c6c8633fa9ce	BUSINESS	3009988.00	31
77e21bd9-b194-4d27-a508-b13385c1567d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	92b33b9c-3499-48ce-8191-9de520a996e2	ECONOMY	1735988.00	160
2409ad8c-b25c-4680-88f4-ef7978fc3254	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	92b33b9c-3499-48ce-8191-9de520a996e2	BUSINESS	3142443.00	12
9333516c-3833-43cf-9244-1edaaa82a1dd	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	4573a061-c122-46a9-baad-12cffa8f00ca	ECONOMY	2327965.00	153
2ac5c994-47f8-4b8d-97d9-5f33fe3a6b0d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	4573a061-c122-46a9-baad-12cffa8f00ca	BUSINESS	4625273.00	29
d89e73ce-8b4e-46d4-ac1e-6e311eb480fe	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	a2721299-bc10-4cba-b3eb-616597316af0	ECONOMY	1900383.00	157
a7dfb3b6-38d7-47cd-8232-fbcce86a46b6	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	a2721299-bc10-4cba-b3eb-616597316af0	BUSINESS	3998634.00	16
cdc6dd84-883d-4367-9753-a66e400cb723	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	e97de657-55a4-4649-bea6-20799e942bf7	ECONOMY	2000942.00	69
e08d5b1b-5bfe-48c9-9510-ff38a58fe619	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	9c85c00b-c9e6-47e3-ac7b-20a18d9f5793	ECONOMY	1874773.00	53
ed264fe2-7c61-496c-9306-bf2590ca0498	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	0cabfacb-bb19-4e7e-b30e-0da2dcd5c717	ECONOMY	1236949.00	243
c1e955e9-1af6-4cde-88ef-1a2ef826c86e	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	0cabfacb-bb19-4e7e-b30e-0da2dcd5c717	BUSINESS	3118890.00	34
5fd8ee59-684d-427e-b003-df8b516fc8fc	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	93b3f200-2df3-49d0-a07a-6f8e101fa45d	ECONOMY	1961090.00	66
e2eb9f8b-da0e-4d47-9a4a-7fda3bedb70d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	75f4a18f-c2fd-49ab-aa43-6d4fa30c9903	ECONOMY	1530515.00	63
4d45cf00-5049-4eb4-9035-0ada8fb1446c	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	9328881a-fdf4-4561-bdc7-35c0cf0a8af2	ECONOMY	1692539.00	156
2fda6944-2e41-4646-8293-e0855be6b1c8	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	9328881a-fdf4-4561-bdc7-35c0cf0a8af2	BUSINESS	3489055.00	12
aa849f73-83ba-4eed-89c4-78bdb3aa1505	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	106097d9-7604-4ec7-be2d-d9871e3ba7d4	ECONOMY	1300468.00	219
7533924b-439a-48cb-bd4c-b2f0bc78aaa3	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	106097d9-7604-4ec7-be2d-d9871e3ba7d4	BUSINESS	3759892.00	33
765b2b85-fc32-41a7-b264-87f23985db32	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	72b78b7c-14e2-4455-94b2-9a7098270ef3	ECONOMY	1904306.00	161
f913b4b7-82a9-45ff-b7db-7bf1213a0142	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	72b78b7c-14e2-4455-94b2-9a7098270ef3	BUSINESS	2901675.00	21
b67503d5-d9ad-4e1d-8669-ae75998abc47	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	87c4a60a-80ef-47e8-9c5d-1eb472402b8e	ECONOMY	2170288.00	226
fbf84aa5-dad1-4349-8977-1200526d04e5	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	87c4a60a-80ef-47e8-9c5d-1eb472402b8e	BUSINESS	3668803.00	30
6cdb6b4a-3614-4f10-91dc-96946fdbc039	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	be03470a-78e2-48df-83f1-e6297c462a16	ECONOMY	1797509.00	176
030270f0-2576-4d28-b4e3-55564352dbcb	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	be03470a-78e2-48df-83f1-e6297c462a16	BUSINESS	4408635.00	22
2ff628f9-b52a-4e7c-b43e-749d2b34963b	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	4f489842-9bbd-41de-b7c5-9c520c60d771	ECONOMY	1905695.00	160
4746452b-a7c3-43c0-9055-b0bf35ef5753	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	4f489842-9bbd-41de-b7c5-9c520c60d771	BUSINESS	3338011.00	18
ea6de3c5-c4fe-49a5-a30b-28e70973056e	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	836c9393-5730-499b-bb6b-fdd027d712b3	ECONOMY	1443904.00	167
724afaf8-1fe5-48b1-af5c-75c37f85bcbf	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	836c9393-5730-499b-bb6b-fdd027d712b3	BUSINESS	3070753.00	15
12d5a86b-6aa9-452a-a717-fbe05345df7b	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	613d0022-dafe-4fa1-9da9-d95bcb3a3491	ECONOMY	2930847.00	60
88765d0c-b401-4f7a-a6c0-bd8812e5802f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	145fd86d-b265-4a85-bc37-764cdb7ed987	ECONOMY	1997422.00	163
c40b206e-6a64-433b-a4c2-8e9518c2a28e	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	145fd86d-b265-4a85-bc37-764cdb7ed987	BUSINESS	4869871.00	13
c68af730-69fb-44f0-95e0-bb6413fb2699	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	673267f3-ad18-4b03-ab01-90086a0fa266	ECONOMY	2189128.00	158
d4822503-fefe-49c1-b7b1-540b1f2348df	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	673267f3-ad18-4b03-ab01-90086a0fa266	BUSINESS	4503522.00	15
a758a4f8-7a77-42a6-bb32-b5f06296d45a	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	d4391439-8f37-4c8b-b581-583954185934	ECONOMY	1729303.00	188
8fecbcb5-2d74-4de4-a575-a71bd523b834	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	d4391439-8f37-4c8b-b581-583954185934	BUSINESS	3506661.00	23
938659bb-b5f1-4f3f-8920-f6ec75798ea5	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	b81571ea-4a49-4841-b2f9-32af6af49267	ECONOMY	2670536.00	166
72acd645-64ec-4bb5-9345-2a1ab27a7691	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	b81571ea-4a49-4841-b2f9-32af6af49267	BUSINESS	4414522.00	15
ad39544e-b578-4b3b-8e8f-dc9137094cca	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	b365ad34-3cf3-4315-83d5-f32acbf0e927	ECONOMY	2248336.00	155
856fbafd-990f-40fa-b51f-1ee41f708336	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	b365ad34-3cf3-4315-83d5-f32acbf0e927	BUSINESS	4402639.00	15
a9f09c51-a098-4304-9da1-53997b35ecc8	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	23e48e6d-2fbd-444a-8774-6356efeff4be	ECONOMY	2454958.00	169
1714ebfa-0fc8-4afc-bdb6-c268c2062308	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	23e48e6d-2fbd-444a-8774-6356efeff4be	BUSINESS	4393602.00	17
81be5f14-f5de-4273-b391-e7c6c97c08b8	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	54ccbca7-5f65-4670-a900-17e5f5d4d9b8	ECONOMY	2853505.00	67
e27b7b37-f5d5-402e-bec1-9974df373d09	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	044badeb-f8ca-4965-b737-aa643083cd5d	ECONOMY	1935916.00	55
959c9fea-99bf-4f64-9f0a-f51f4dfcd894	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	008bd5af-8b62-41cd-9139-13cb8d700d03	ECONOMY	2173097.00	52
fd851c42-d8a4-4247-89a6-8f9d5d42c658	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	7f3da7ed-3bb8-4448-92b3-49d689490416	ECONOMY	2316114.00	130
da4de48d-229b-4ac5-ab54-a6c0cc15c433	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	7f3da7ed-3bb8-4448-92b3-49d689490416	BUSINESS	4693292.00	29
8d7c041c-ac33-48f1-8d76-616a4047a645	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	35e008d1-db17-474f-a84a-98c5ce1d1f6f	ECONOMY	1860810.00	125
090a2469-728f-4279-84eb-62b40f6fa1f8	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	35e008d1-db17-474f-a84a-98c5ce1d1f6f	BUSINESS	4839049.00	23
db1e32d7-c969-4aa5-99da-1df8fecec03a	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	07572566-8039-44ff-b286-b9ec6a84edb6	ECONOMY	2053906.00	69
9765fbfe-d477-4212-9bdf-35c695cb6986	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	f07d27e1-6a8e-43e4-9f15-5af46a48cd5c	ECONOMY	2185593.00	156
16cb3731-7353-4dfd-8272-896234597fec	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	f07d27e1-6a8e-43e4-9f15-5af46a48cd5c	BUSINESS	4667725.00	15
d246572b-71c6-4de8-894c-d4647ca3e9bf	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3f7b8004-7746-4d06-8719-b23c6c346836	ECONOMY	2092399.00	170
1c238d3b-975a-49ac-9aef-f5c498e80fa1	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3f7b8004-7746-4d06-8719-b23c6c346836	BUSINESS	4100705.00	17
52ee2fef-a32c-4bb1-b825-1f14b3222d9a	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	9f4d69f8-67a6-4c5e-ba97-8914c4991cb2	ECONOMY	2642708.00	58
1f4ae9cd-cc7b-471a-b58d-7197e42b9d71	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	26463d9f-1ad1-4a48-b7da-7f4d5e86305c	ECONOMY	2180236.00	56
e16aee4a-1896-4323-b530-e123040ce305	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	87e3a202-6f9e-4fc5-8409-66072587c6fe	ECONOMY	2412842.00	174
b779d947-ed56-445c-ae4b-0532ed182a66	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	87e3a202-6f9e-4fc5-8409-66072587c6fe	BUSINESS	4001755.00	12
07f8f6f1-ef38-473b-a594-aac366f23a5f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	cc5b8d1b-d6cf-43be-9b0b-1e484d98673d	ECONOMY	2440221.00	59
b87ea34c-5ece-4f0d-9de6-fa73b4d0e0c8	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7b9c4e40-02ac-4878-a140-30866a11a7e8	ECONOMY	2084700.00	142
e233c1ed-5dec-4b4f-82de-cf138f19e7cc	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7b9c4e40-02ac-4878-a140-30866a11a7e8	BUSINESS	5262517.00	14
2b688f7e-5d64-471e-93f1-d5d8ca1dcaf0	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	60933fe0-98b0-45ac-ac8f-f2466544af3a	ECONOMY	2379680.00	179
70e0b93f-9903-4e9b-a010-f8b9c60eff93	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	60933fe0-98b0-45ac-ac8f-f2466544af3a	BUSINESS	4052955.00	19
55a6a3a2-1fc8-4550-b415-22d5dd2a2f54	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	b020551d-19d1-4b56-be2a-0c939f10f0cd	ECONOMY	2535994.00	57
4f6674e6-2c87-46cd-83c5-aa3da2902855	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	de7eaa89-ec66-4731-8a95-a0e56a41dc18	ECONOMY	3222827.00	174
b537cfe7-0a21-4453-b505-d3604f9e009d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	de7eaa89-ec66-4731-8a95-a0e56a41dc18	BUSINESS	4947134.00	18
3b4f3034-18d8-48ea-8fc1-328a9bc9c162	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	022bff68-458c-4279-aca0-b1493149c0ca	ECONOMY	2404489.00	147
ccff7e23-ca14-4fca-aada-9a5d5d8aca46	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	022bff68-458c-4279-aca0-b1493149c0ca	BUSINESS	5575617.00	28
181c557d-f356-4e8b-ae42-24e66daefb92	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	659ea18d-7edc-4f34-9ac4-f3947c91d8e3	ECONOMY	2718413.00	213
cbe289cb-5e8d-4cc0-b26a-cf69d497ad6e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	659ea18d-7edc-4f34-9ac4-f3947c91d8e3	BUSINESS	5096901.00	31
77b0cfe8-8e51-46e9-bd2a-d6ec7c7184a8	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	751cd4bf-4b35-4368-8d15-f681543b9498	ECONOMY	2259773.00	182
6ef261c4-3dc4-465a-9eb4-896e2c758242	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	751cd4bf-4b35-4368-8d15-f681543b9498	BUSINESS	4442539.00	17
6115c56f-4fe5-4def-81fe-7304fa2f37b5	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e96ea9ae-bf7b-4a73-b739-7522bd0de925	ECONOMY	2635691.00	171
83de7091-b22f-4363-a928-a7e7dc81223a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e96ea9ae-bf7b-4a73-b739-7522bd0de925	BUSINESS	3662268.00	19
999df217-86e8-4ae9-8d7c-053c14909261	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4d3ea774-40d9-453a-b142-5e0c4913458b	ECONOMY	3064800.00	192
dc8ee355-e684-4d30-8d5f-916249f682e0	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4d3ea774-40d9-453a-b142-5e0c4913458b	BUSINESS	5575375.00	27
b6f7b13e-c5b9-4f83-ad48-8be16d7c5db6	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	f70c5a80-836e-47b7-aef6-3b1ca7282ca4	ECONOMY	2761924.00	176
698cd273-2cbe-4036-9783-0568564e160e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	f70c5a80-836e-47b7-aef6-3b1ca7282ca4	BUSINESS	5275394.00	14
e201434e-29f6-4953-8c31-4ac374439ff1	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	65243a79-1be9-4ede-b4e8-4df91c8cbd1e	ECONOMY	2739543.00	151
d8a369e2-829c-4f6c-a0b9-98a388c1fc62	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	65243a79-1be9-4ede-b4e8-4df91c8cbd1e	BUSINESS	5570615.00	19
1bbb96b0-9703-4ba4-952b-757585e8f72d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	835bab1b-7a74-44d3-906a-086a10621402	ECONOMY	2787766.00	177
e7ce5a2e-da45-4416-ac05-163b2ef4cab3	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	835bab1b-7a74-44d3-906a-086a10621402	BUSINESS	5282106.00	16
8b2eaa65-0a48-4519-9e4c-d07df071ab9b	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	76ed55a0-3fa4-4e63-a890-ab6f7df38856	ECONOMY	3174260.00	68
92fa016f-7460-4f51-b819-7370e389cb17	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e00c2a2f-f52e-464c-8c31-3dfc882884b1	ECONOMY	2418693.00	199
2c146657-68c1-4434-a9c0-bb3eebe53e3a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e00c2a2f-f52e-464c-8c31-3dfc882884b1	BUSINESS	4145833.00	20
2a758e57-a58f-4770-997e-88a1523d6081	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	d006af0f-e3bb-443a-ac4e-5643767fbfee	ECONOMY	2510598.00	55
e01302c9-54fc-4be8-83eb-e8c32ddb0533	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9828fe71-a599-499b-a58a-94efa0c199e4	ECONOMY	2498525.00	238
8641c29c-2f4b-483e-bb7e-4e1552d6cec7	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9828fe71-a599-499b-a58a-94efa0c199e4	BUSINESS	6322460.00	37
19f1eff8-cb8e-49aa-9907-fe3241d548bf	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	37f07bac-ca1b-4bbf-8175-25c0982c722a	ECONOMY	2587996.00	65
35509dbd-7a6c-4574-8457-7eba7a1f2fbd	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	36f067f8-d998-4c7a-8c1c-143b5e28c67d	ECONOMY	3018606.00	148
e9c98f24-c431-436f-b214-6d508c07b595	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	36f067f8-d998-4c7a-8c1c-143b5e28c67d	BUSINESS	6354736.00	17
27ccf54a-a112-4691-918b-e3d335f9fc36	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	35c6e193-3773-4d15-9ee3-43f73f9eeaf1	ECONOMY	2502931.00	202
4d8324fd-42c0-489d-a5f7-e64181649114	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	35c6e193-3773-4d15-9ee3-43f73f9eeaf1	BUSINESS	4722159.00	34
f23fb512-a97c-45cc-af0b-2ef7e18de707	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	688ca275-5b5d-4f6b-88b3-e70bb8d64cc2	ECONOMY	2576190.00	200
314b7c84-f716-4e90-a06f-405d75cf46cb	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	688ca275-5b5d-4f6b-88b3-e70bb8d64cc2	BUSINESS	5849267.00	32
afd113a1-85db-44e7-99ff-9212ac4cc220	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	0a2f2089-73d0-4a75-bb47-cf705c7c0aef	ECONOMY	2413673.00	143
cf8ac6da-c25c-4c97-9b25-ab0c421020a4	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	0a2f2089-73d0-4a75-bb47-cf705c7c0aef	BUSINESS	5482646.00	18
40e621f5-8841-49e5-948c-81c1afef71db	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	1c91557f-ddf1-40a4-b9dd-f32c08e8667e	ECONOMY	2340029.00	227
beb4648d-e17f-43e3-9ff5-e0dee5ccee2b	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	1c91557f-ddf1-40a4-b9dd-f32c08e8667e	BUSINESS	5672301.00	31
965fc67d-d24d-4330-a09a-a96a29827362	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	ac7dd7c0-4dad-44fb-9b3a-a0301082b1d5	ECONOMY	2404869.00	59
c9b04a6b-55ea-4b0e-a14a-753c31c9e77e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6cc18ee7-e6a8-4a90-a8ed-abd59b27e319	ECONOMY	2813826.00	170
aa46c204-fe10-45c4-9f2d-0529691b86f2	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6cc18ee7-e6a8-4a90-a8ed-abd59b27e319	BUSINESS	4285858.00	19
d52d07c4-0850-421e-9cdc-d0757ccd0c0a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	dde77500-1cd0-45ef-8ff5-a84face1f53d	ECONOMY	2061260.00	166
ca80c388-20d1-4e76-b94f-9350e9add01a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	dde77500-1cd0-45ef-8ff5-a84face1f53d	BUSINESS	4470707.00	25
2159940d-b521-4292-bb84-ee187c940458	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	bf66064c-46ad-481f-a42f-5a147c0b880f	ECONOMY	2305712.00	142
e4b1e0bb-1673-4a02-9b97-0632f4dfd58e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	bf66064c-46ad-481f-a42f-5a147c0b880f	BUSINESS	4607903.00	29
62ffa797-40d8-4f42-913e-a7c77808ee22	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3cc80e4a-b35b-4a97-837d-6af8e6f386cd	ECONOMY	3043113.00	179
cefcd155-e9ab-4ef7-8474-333a2f734fe8	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3cc80e4a-b35b-4a97-837d-6af8e6f386cd	BUSINESS	4799997.00	18
68324c3e-2f37-4a42-9634-5dd59227deb0	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	1cf295e4-06b3-4e97-8ad4-a7fe4d57306e	ECONOMY	3462698.00	249
4c73024e-b15c-401a-9423-17dd84d9a038	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	1cf295e4-06b3-4e97-8ad4-a7fe4d57306e	BUSINESS	6353555.00	33
38c36155-e5b3-453e-9c98-ecd0a777f924	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4d388234-24b6-4f34-aaed-d01a5c70616e	ECONOMY	3270067.00	68
68bc6d94-d7e0-45f1-a66f-5e0315d9efe0	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	a0ab9340-7b76-4725-823e-836b0df702dd	ECONOMY	2844522.00	62
529bd672-1d04-4feb-982d-52b8144d005e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	47cafe1a-ed1b-4785-a068-8ca18e163904	ECONOMY	3173953.00	147
864c3a76-3f40-4b75-a387-ea296759bbfd	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	47cafe1a-ed1b-4785-a068-8ca18e163904	BUSINESS	4679383.00	21
be9b1aa2-d857-4d61-b887-21ccf801db19	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c85ddc42-ee13-44bc-b3bd-bd41d2ebf34a	ECONOMY	3587468.00	223
90bc6216-868a-4e1d-8848-42cf1dd3aa27	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c85ddc42-ee13-44bc-b3bd-bd41d2ebf34a	BUSINESS	6327555.00	35
3f757bc0-69fd-446f-b0dd-a0f749dafb1f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e9d578b7-196f-4a53-8593-1ab2c57571ed	ECONOMY	2018980.00	62
fd814340-f68e-4ffc-95dc-248fca8045f4	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e3164799-4bb7-4528-bf60-8c4c325a72bb	ECONOMY	1582520.00	177
cb0996d9-d051-4109-9a0e-5810ec23b6af	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e3164799-4bb7-4528-bf60-8c4c325a72bb	BUSINESS	3468946.00	12
2b5ef347-8965-47a4-870f-53e24440eafb	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9f04760e-2549-479e-b166-36acb9ecbe49	ECONOMY	1667326.00	157
21bfe577-df03-4ec1-a7b9-3c5330539916	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9f04760e-2549-479e-b166-36acb9ecbe49	BUSINESS	3655684.00	13
47dd1bd4-6044-47ed-bd4a-214dd16e3921	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	1584d657-2df6-40f2-8429-3e1fe43b1552	ECONOMY	2273203.00	140
f15fef6c-2a1c-44c4-9f65-15256c44eef3	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	1584d657-2df6-40f2-8429-3e1fe43b1552	BUSINESS	4623603.00	20
e3bc5097-90ea-4024-b57e-045612a281fe	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7046a00a-fbd5-4af4-a078-287ad1181533	ECONOMY	2151051.00	141
ecf152a9-2a8c-4796-bfa9-71b555cbc383	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7046a00a-fbd5-4af4-a078-287ad1181533	BUSINESS	3364629.00	25
c91e4ac9-f751-4a30-bdef-6a16232e032c	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2f40d736-fb05-45fa-b3e9-5144b54d92f5	ECONOMY	1871111.00	162
7886ea86-3fe3-470d-b19c-d04bb575e899	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2f40d736-fb05-45fa-b3e9-5144b54d92f5	BUSINESS	3615845.00	18
177fa2a7-e921-4df5-a6d7-ebf7d67408b8	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	acce0754-ec70-48b7-9427-185de68b5e5c	ECONOMY	1474044.00	185
5eee2770-c1e0-4645-bdf7-31c15d6eabbf	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	acce0754-ec70-48b7-9427-185de68b5e5c	BUSINESS	4058562.00	16
18a2fb3b-914d-4e76-87c6-96ce87105144	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	22af9330-178f-42e9-a40f-c51418e89b53	ECONOMY	1240033.00	162
778951ca-48b0-4c37-8a1c-2b22f855b7ad	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	22af9330-178f-42e9-a40f-c51418e89b53	BUSINESS	3963209.00	12
2a664f60-39d9-46a3-922d-29779db5bae4	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	989af986-ab16-41c4-9efb-9ef411ed79be	ECONOMY	1585102.00	169
5f1691d3-8311-440a-805f-eccfb56f19f7	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	989af986-ab16-41c4-9efb-9ef411ed79be	BUSINESS	4179212.00	15
c1100735-380a-46b4-9df2-554ef3982274	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	a66c6905-720c-41d7-8ed1-f8e018b75b1f	ECONOMY	2289659.00	192
31f9a44a-58a4-4b41-b835-1492e9f82fa3	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	a66c6905-720c-41d7-8ed1-f8e018b75b1f	BUSINESS	4235243.00	24
5a6ae388-4190-44a1-942b-61fd5c6c4588	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9445ac5a-ee20-4dec-a66c-0edbe73f7038	ECONOMY	2112724.00	163
0d38bd9e-9adf-4000-b62c-6ea4be42cadf	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9445ac5a-ee20-4dec-a66c-0edbe73f7038	BUSINESS	3504301.00	20
c046baaf-8ab1-4ad5-bc88-a8635191b3ca	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	a7e8de7a-2d9d-4f58-ba92-f8ec9bc12541	ECONOMY	1919229.00	197
d0620d27-710f-417d-8ecf-be2da3198bce	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	a7e8de7a-2d9d-4f58-ba92-f8ec9bc12541	BUSINESS	3746744.00	18
07c74903-c4ed-4e9c-ae7a-0c7374230a3c	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	34d5bc6c-583a-44d7-8028-3bb52c9d3c22	ECONOMY	1535987.00	153
9ba18f12-0d5d-4ee7-8e9b-9aa1775dd117	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	34d5bc6c-583a-44d7-8028-3bb52c9d3c22	BUSINESS	3590088.00	14
770ed35b-d9b7-49a5-ae9b-c135ad2db268	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	da3b24c0-91de-473d-9b75-aaf51fc81fff	ECONOMY	1793920.00	163
812a9190-f92c-4ace-b351-44b4129d39b7	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	da3b24c0-91de-473d-9b75-aaf51fc81fff	BUSINESS	3913467.00	22
e6b13766-70f7-440d-9b02-d64666cd25dc	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9f0ef1ac-2f43-49fa-bdd4-3a27bc850cf4	ECONOMY	2185370.00	63
61699de0-f4d7-4011-9a57-0ab41e887469	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	71698fed-d48f-4060-b1f1-c4c1b2568819	ECONOMY	1935054.00	195
bc43171b-8e7b-4a53-b8ca-c48c6bf0e2a6	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	71698fed-d48f-4060-b1f1-c4c1b2568819	BUSINESS	4310361.00	25
f81c24f5-59f0-4976-8b30-62aeb87658f0	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	27b136ec-fc7c-41d5-9147-d52533ac845a	ECONOMY	2056533.00	174
8067b2a8-53c3-4a83-8179-ac4ae2cbf3ad	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	27b136ec-fc7c-41d5-9147-d52533ac845a	BUSINESS	4405474.00	29
9ec7a126-4aa8-4369-a3e7-9801015f5fe8	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c7b6f986-383f-4d45-92ef-298c8b4aba92	ECONOMY	2208670.00	140
588beaa5-d57c-45a5-b829-cc4dab4503de	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c7b6f986-383f-4d45-92ef-298c8b4aba92	BUSINESS	3500316.00	19
588668b0-cec6-4529-b9d1-3f883b9fe270	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	bc2d71c0-da38-410b-9906-6a46574f8dea	ECONOMY	1851389.00	165
66fe5932-b6e2-427c-b820-c1d85ebba753	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	bc2d71c0-da38-410b-9906-6a46574f8dea	BUSINESS	3980964.00	23
15e6df10-7c8c-4ddb-9077-98f1d8b2eeae	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	98bcbe86-abff-4f83-8ed3-32754e7a8390	ECONOMY	1902371.00	50
e43f912f-dd9b-4e5c-987f-7180798642ba	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	ee8f657b-1ef0-4697-8601-7f24c5444b3d	ECONOMY	2196855.00	53
d516c45c-736d-48ee-8768-2971b4f5283d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5a5c7659-e3de-4753-bf17-930b1ffdb339	ECONOMY	2155957.00	174
902790b1-8bc0-429c-96b4-affb00e5e6ac	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5a5c7659-e3de-4753-bf17-930b1ffdb339	BUSINESS	3665237.00	17
1211489a-6a6a-4b01-a1b0-455064b703be	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	de5d4833-c4a0-459b-aad6-cbadc1714243	ECONOMY	1799939.00	241
35882936-5347-493c-8bf8-0fd78e450aa5	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	de5d4833-c4a0-459b-aad6-cbadc1714243	BUSINESS	3965675.00	37
f0fd4dda-be35-41fa-90e1-a4a68323381c	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7474d873-98c4-4679-aeb9-03b2c8c8428d	ECONOMY	2597010.00	212
e5208891-8039-473c-a24d-623bafc6a3f5	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7474d873-98c4-4679-aeb9-03b2c8c8428d	BUSINESS	5660969.00	29
7da9fc18-87f6-4108-b46e-db8cbff7a7dd	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	684e7c93-bd39-4dcd-9458-978aab0ff02e	ECONOMY	2794889.00	171
e8b114e0-4130-4699-a59c-4886bea08262	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	684e7c93-bd39-4dcd-9458-978aab0ff02e	BUSINESS	4964507.00	16
fa16cac9-3194-42cd-b82c-eb643466d473	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	526cd407-4da2-4ccd-a97c-80df4a1422ce	ECONOMY	2074103.00	193
79e49f99-3811-4786-a2cc-d2582745450e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	526cd407-4da2-4ccd-a97c-80df4a1422ce	BUSINESS	4559251.00	25
16d5175e-554f-4a91-9add-8ab135dc2fdd	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c5540f4b-f857-4b38-8358-28615ac6c408	ECONOMY	2304580.00	202
01e7098e-0481-4f88-a3ee-75a36a9fc71c	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c5540f4b-f857-4b38-8358-28615ac6c408	BUSINESS	4173268.00	24
d0b25ec2-4ac6-49cd-9d7a-ebb532aa511f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7605a67f-5ebc-4543-b590-67d44dd5c84e	ECONOMY	2537702.00	68
1884dcc8-6f37-4988-91b8-9ee0eecd5e34	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	0820c366-c599-4e17-8679-e6fcda463aa0	ECONOMY	2241330.00	200
323f4f24-2bc4-47bf-813d-7c24a4f947f2	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	0820c366-c599-4e17-8679-e6fcda463aa0	BUSINESS	3738809.00	25
56a33906-e057-434d-bbab-cfab56598bb7	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c516fa4f-a57b-40c0-9ea2-ea48328d5bca	ECONOMY	1884235.00	155
ec73f7de-3c7b-4b78-8b28-2b3015f21d7d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c516fa4f-a57b-40c0-9ea2-ea48328d5bca	BUSINESS	4028864.00	25
0085db0e-e7a2-4815-a112-9197e171b52a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	adf0d141-3992-4b88-b5d7-e438adaf2f7d	ECONOMY	2469974.00	147
a507f661-465b-4fe5-b064-b82d1f6050a9	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	adf0d141-3992-4b88-b5d7-e438adaf2f7d	BUSINESS	3910926.00	16
e41d9403-353e-401f-94bc-601566c1d58a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	53fecf88-61a5-41f1-be79-2c42ea01730c	ECONOMY	2012116.00	58
1070bff8-ab85-423c-94db-c67a8b2717ce	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	95dd38cc-c458-497c-9e17-8720828476f9	ECONOMY	2054354.00	171
4e09d0b0-a711-4715-a1ce-9977f2b4b682	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	95dd38cc-c458-497c-9e17-8720828476f9	BUSINESS	4822111.00	18
0adddcb7-6266-4ca9-abfc-811912f05365	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e39d6d92-261a-4680-a1b9-646b5ec50cd9	ECONOMY	1751099.00	189
eb2041e0-70a7-4f81-aa69-4d23a3ac65c9	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e39d6d92-261a-4680-a1b9-646b5ec50cd9	BUSINESS	4061226.00	23
a1177ed2-fee2-4f1c-8235-7abfcfa92cba	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	81f33823-1a33-4266-98fa-bf3708495b3a	ECONOMY	2654622.00	182
daafe671-cb97-4d8f-91ac-cdd8e499b964	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	81f33823-1a33-4266-98fa-bf3708495b3a	BUSINESS	4990048.00	23
371089aa-8dba-4aad-85c0-18e2891e7e70	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c988eb1d-0a06-43fd-92a8-728c9d0a38a6	ECONOMY	2959120.00	194
92df384b-985f-4049-b10d-90f1050e02dd	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c988eb1d-0a06-43fd-92a8-728c9d0a38a6	BUSINESS	4708231.00	21
7bf608c6-6c8a-4222-b68f-58534260ff03	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	54e87d9f-1235-4e53-ab14-af8b240968cc	ECONOMY	1830658.00	196
c7fa99b6-7919-471f-9e94-faf20084f813	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	54e87d9f-1235-4e53-ab14-af8b240968cc	BUSINESS	4609988.00	17
a1fcf9c1-93f0-4f3b-91b1-0c85d7d5479b	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	687c613a-615f-4745-906b-eacf45c6a023	ECONOMY	1771794.00	205
ae063819-b1e6-4262-8713-a1578e69c791	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	687c613a-615f-4745-906b-eacf45c6a023	BUSINESS	4416062.00	32
0463ae6a-6981-4df0-8bc8-36f30aa230f2	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	b7af2560-5c58-4a44-9e08-082f38d4a440	ECONOMY	1785449.00	158
bd673381-3891-4e3d-9ef1-5b9a0d869b34	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	b7af2560-5c58-4a44-9e08-082f38d4a440	BUSINESS	4267357.00	25
ae14c5f7-4a64-421e-bdeb-1e136c4f52d9	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4cd140fa-a7fe-499a-89c4-5a2136660089	ECONOMY	2083518.00	226
8a84b39b-173a-4ef9-8c2b-fae128deec83	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4cd140fa-a7fe-499a-89c4-5a2136660089	BUSINESS	5358790.00	35
df5718b8-4c58-46d2-a64e-30488b40b055	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	f2824215-c005-4c49-bc25-969e6ec054c7	ECONOMY	3198878.00	65
9af73981-6cfe-4ccf-ab04-971cd5bd9ebc	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	42812cd8-3ce3-4924-9e81-a97688f6c4f7	ECONOMY	2472288.00	164
8020a486-83a7-4c7e-aae9-e7d76f50cfc5	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	42812cd8-3ce3-4924-9e81-a97688f6c4f7	BUSINESS	4158719.00	12
16bc9a2d-9f9a-45bb-8ddf-f18f89574c2a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2d61d21a-aa7d-460b-b719-7f0398a40506	ECONOMY	2249567.00	177
628823cf-3530-4538-ba60-8721535384f5	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2d61d21a-aa7d-460b-b719-7f0398a40506	BUSINESS	3987847.00	16
ef97817f-f27a-4bc4-a053-209f8b4bf1c9	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e59835d6-28af-4755-8878-a82b39ccdb18	ECONOMY	2802015.00	214
eea13986-bc31-47e2-8826-ab2754707d29	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e59835d6-28af-4755-8878-a82b39ccdb18	BUSINESS	4574335.00	26
e2c1eb4e-0868-4016-b2d7-a5aefa373803	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c645eb14-0c29-491a-9de2-287113a97526	ECONOMY	2047263.00	168
3ab84689-ffd7-4964-8a96-798c1ca54350	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c645eb14-0c29-491a-9de2-287113a97526	BUSINESS	4721106.00	20
c6805e9e-1b4e-40af-baca-9c67e4db67cf	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	0a69070b-dd57-47dc-8f70-07bb773e07d6	ECONOMY	2049235.00	177
f4d91a12-8611-4a48-8419-dddbda0f451e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	0a69070b-dd57-47dc-8f70-07bb773e07d6	BUSINESS	5386856.00	24
b7b7d9ba-56dd-4742-9fd4-3564dcd4c673	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	944ea5fc-4c14-4d79-b0d8-5c38a5fa393f	ECONOMY	2683322.00	231
06201344-db06-4eeb-8479-b07fb6da34a9	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	944ea5fc-4c14-4d79-b0d8-5c38a5fa393f	BUSINESS	5435731.00	34
f68abbd2-cd3f-4906-8a72-59b173c13e48	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	327a4bd6-6724-4a44-9816-c304783ba807	ECONOMY	3016489.00	175
8088ba21-9d60-4eb5-ab7b-061e14fe2ac2	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	327a4bd6-6724-4a44-9816-c304783ba807	BUSINESS	5158964.00	17
47e5aa6d-4d2d-43ab-98b1-920937abaea6	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8b6400ec-9557-4075-8258-09b8c55bfd37	ECONOMY	2974414.00	66
7adda124-c6ea-4b35-b7ad-fad3e7e76baa	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e7ce4299-84e1-4c7e-b2dd-ee178a9387a7	ECONOMY	3290386.00	196
9e3d8755-79cd-4dbf-8a6f-f16cdf980555	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e7ce4299-84e1-4c7e-b2dd-ee178a9387a7	BUSINESS	5229538.00	19
5d1c0f09-8604-43b4-a67d-2ce783cfbb43	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e9068b10-1a08-47ae-bacb-6eeafb31f7fc	ECONOMY	2479669.00	54
a20867e9-76c7-412f-b8bf-85f37cae4d94	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	0f904a3c-e3b5-443a-b619-37d85b5ed176	ECONOMY	2963909.00	170
1dbea2b1-ec07-4953-917d-5a64a6525f38	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	0f904a3c-e3b5-443a-b619-37d85b5ed176	BUSINESS	4997479.00	12
e3fd5169-3f95-475a-868e-6821d4f8e95d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	bef7a1ec-7973-4642-8663-3cb416a5edb9	ECONOMY	2237476.00	66
1941577e-bd27-4a5b-85dd-f02eb3da394f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	265e0995-5231-4cea-8f9c-cf9a47474513	ECONOMY	3024526.00	53
3bebb5da-2086-40be-ac55-7bfba689243c	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	060adb81-d70f-4cb2-a372-33d5f46b013f	ECONOMY	3102393.00	176
414ea9be-c8de-4599-9194-ca59e2d515da	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	060adb81-d70f-4cb2-a372-33d5f46b013f	BUSINESS	5145699.00	20
d85219f1-3775-4904-a536-e752058bc2da	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	a670c966-288f-4f31-aa93-de401207a66e	ECONOMY	2712641.00	69
e8546eca-d0a3-4c76-9e43-dd416e203c6e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2834ed68-bd49-4fc7-90fb-2a32121ed445	ECONOMY	2902887.00	244
ad11359b-30bf-4c38-b63e-a1da7704c24a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2834ed68-bd49-4fc7-90fb-2a32121ed445	BUSINESS	4706492.00	37
d20a6635-e39f-4813-b714-af9874f0c0a0	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	14dd4209-27a1-46d9-baf2-0f4b0b3a91b0	ECONOMY	2618697.00	149
2bffabfb-f47e-46dd-9916-b3f3d1b514f0	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	14dd4209-27a1-46d9-baf2-0f4b0b3a91b0	BUSINESS	5050757.00	18
c988a87d-2b34-4583-9246-76a0e1106e11	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8129852c-ccae-4056-9aad-e223796af533	ECONOMY	1994190.00	66
9d8cfe6d-ce22-4d2d-a6a0-588d7322ef4f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	330dd0fb-194d-491f-aec3-0b2c31013641	ECONOMY	2533583.00	199
edec664d-19a7-44a5-b7b7-1e3e1a587103	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	330dd0fb-194d-491f-aec3-0b2c31013641	BUSINESS	5151387.00	20
d85e3720-21d0-4faa-bdb3-959cda2d48e6	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	671c9780-fd71-49fc-8680-98869ee09ecb	ECONOMY	3260845.00	162
a9cf3d52-eb11-4c5f-a179-ad540ef157de	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	671c9780-fd71-49fc-8680-98869ee09ecb	BUSINESS	6203448.00	27
2b678b4c-70ba-4462-baf5-7956ec19ac85	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7a134f47-ad20-4e6b-82e3-3ffef1762ccd	ECONOMY	2718928.00	56
46fbf274-b22a-4631-9325-390f7e94b486	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3a1df529-da06-419b-a53a-000eb9dd398a	ECONOMY	2915259.00	170
d3510c68-9792-4164-97b5-313e1a9ca70f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3a1df529-da06-419b-a53a-000eb9dd398a	BUSINESS	6324841.00	16
6a1b0e84-9487-4339-bb66-cdce8378a40d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	22097611-7360-4669-a310-3a286fafffc4	ECONOMY	2113514.00	168
f86f59c5-cea5-4bd5-a0fd-91198ac65657	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	22097611-7360-4669-a310-3a286fafffc4	BUSINESS	4703186.00	28
2a3cf8a4-2a66-47af-9724-a6a3a0b61908	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	62ffafd7-3e9d-4932-8e85-80acfa554a81	ECONOMY	2757650.00	163
6a2b886b-a260-4877-8bd6-959580fb260a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	62ffafd7-3e9d-4932-8e85-80acfa554a81	BUSINESS	4224346.00	18
4677d816-b4b6-47d1-a4e4-6d72c25e4c06	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	61551d9d-6b06-405a-85e8-61df72d4c798	ECONOMY	2947870.00	169
3683a68b-2467-40aa-91ea-eaf937bf8184	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	61551d9d-6b06-405a-85e8-61df72d4c798	BUSINESS	4361803.00	26
21b76e7d-90dd-4845-b3cb-427af0fe6647	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	730aac5f-fe1d-4bfc-9d7d-44444b851917	ECONOMY	3321732.00	171
fbb233d5-3051-40dd-b1b5-cc7ce736f56d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	730aac5f-fe1d-4bfc-9d7d-44444b851917	BUSINESS	5061047.00	17
f3deee4a-0963-411c-bff2-34a5bfbe7b37	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	ae0dc300-3bd4-4df7-86fc-9ec79f5734d9	ECONOMY	2281012.00	148
055745fc-7f5b-4286-acdb-26dbc7ec6b03	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	ae0dc300-3bd4-4df7-86fc-9ec79f5734d9	BUSINESS	4340529.00	15
10e385e2-48ce-4123-b90f-9f318cb3c398	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	038bfaae-1112-4ee4-aa69-2332b629c15f	ECONOMY	2463239.00	180
e3b3e790-e853-48a5-9153-be991af32c48	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	038bfaae-1112-4ee4-aa69-2332b629c15f	BUSINESS	5043082.00	22
770c2f8c-24e4-4007-af99-39c1e5fe9b5c	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	441f4f80-bef4-4640-a844-65d3781792d3	ECONOMY	2696215.00	145
6af79c4b-69af-476b-bbec-3c06b891d3ee	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	441f4f80-bef4-4640-a844-65d3781792d3	BUSINESS	4571097.00	18
55db2682-fbd1-46b0-a3a3-4de0cd2a7a38	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6a4b9288-75bb-4a8c-9110-5b26209cac9a	ECONOMY	2988346.00	171
de043185-0352-4fb0-9c85-fbbfb0ae9551	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6a4b9288-75bb-4a8c-9110-5b26209cac9a	BUSINESS	4478306.00	21
9f127e91-1f6b-42e2-b568-ac68ce64925f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5ebee3af-99f0-48cc-8272-d2242ac87b92	ECONOMY	2577199.00	141
ddda8fcf-9e70-4222-a9d9-bc5dd0b655f6	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5ebee3af-99f0-48cc-8272-d2242ac87b92	BUSINESS	5605719.00	19
f4b1ebee-f754-4900-b4bd-4a9ad6aa62af	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6fb8e984-7152-42b4-b5db-7465c716eff3	ECONOMY	1307540.00	172
8756912d-63da-4e32-9100-0496c9605982	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6fb8e984-7152-42b4-b5db-7465c716eff3	BUSINESS	3524154.00	19
cb107dcf-28ac-466c-9896-db15bb430059	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c0790599-7efb-456d-89e2-928efbd6cdde	ECONOMY	2181386.00	147
407d6292-2703-429e-9c1f-cbb231c7cb06	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c0790599-7efb-456d-89e2-928efbd6cdde	BUSINESS	4597234.00	15
c96227cc-e3f4-412d-88bd-19d3e6859107	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	13ccd2e2-4652-49d3-9957-b9dd713cf721	ECONOMY	1324601.00	133
2dcf927d-affd-4684-bf30-39d7b7db8df3	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	13ccd2e2-4652-49d3-9957-b9dd713cf721	BUSINESS	3205916.00	28
414c86e8-d828-4478-bd00-8eab3eda80e0	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	dcedb24b-b85c-41f6-a67e-e7d04c5bbde4	ECONOMY	1937100.00	162
981244b6-f661-4459-886b-eea2da22f0f7	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	dcedb24b-b85c-41f6-a67e-e7d04c5bbde4	BUSINESS	3724268.00	24
dabb62af-1487-4a5a-b7bb-305c2427fe4c	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4754817c-b31a-405e-8700-8bc7df899357	ECONOMY	1673647.00	201
226cc14b-2738-437e-8e4c-323a5f093a22	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4754817c-b31a-405e-8700-8bc7df899357	BUSINESS	3350786.00	27
65ae1f57-26c2-45cf-b3e3-c137af583dc2	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	35745e9e-4805-4517-91ff-93de3f924f69	ECONOMY	1782220.00	162
d1c641e9-728a-4629-913b-7d7360a18e5a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	35745e9e-4805-4517-91ff-93de3f924f69	BUSINESS	4243860.00	25
3bfae187-800e-49bb-89f9-6ac897697ff5	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	773eb36e-7506-4b94-bf8b-760091efa7d5	ECONOMY	1763923.00	60
02ce21a1-3ff0-4626-9e39-39113cd6f024	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e274dc7b-88ce-4a91-b3b4-831b962c0f4d	ECONOMY	1892149.00	52
6b83232b-69a5-4d52-add2-98ed0ddecd55	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	cbdd2022-efe5-4e96-84b8-553fc3faae70	ECONOMY	1932463.00	217
b25eb9f8-7e7d-447e-83ae-f71b2a7057f5	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	cbdd2022-efe5-4e96-84b8-553fc3faae70	BUSINESS	4263839.00	27
307748f4-8739-4fda-9ba5-b95eddb42e80	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	ebdae6b6-2f2a-473a-80f7-da55f233a9fa	ECONOMY	1505580.00	171
c6fa08b4-a314-4a59-926f-37cadc603f9d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	ebdae6b6-2f2a-473a-80f7-da55f233a9fa	BUSINESS	4450111.00	14
8e8b76b9-0877-4bc3-a062-f8aa7cdb5a04	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3543bf68-a069-4512-9922-053f9359cc0f	ECONOMY	1083621.00	152
85168087-0644-4b99-9adb-2d835ee5e583	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3543bf68-a069-4512-9922-053f9359cc0f	BUSINESS	3150850.00	15
48393494-8400-4723-bae5-23dc5f0d335a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	1206128d-8909-404b-afd7-2bc3385a5a9a	ECONOMY	2325616.00	147
e3c8bc06-80eb-4f36-ad69-bff4490529ad	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	1206128d-8909-404b-afd7-2bc3385a5a9a	BUSINESS	4469301.00	13
8dbdeae1-8b39-4f93-b288-657cfd51def6	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4449b58b-d4dd-4dfe-b208-27adfdd9e480	ECONOMY	2174765.00	225
d3635fd5-57d4-43b3-b7b4-b18d99e5dea4	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4449b58b-d4dd-4dfe-b208-27adfdd9e480	BUSINESS	3604003.00	33
0d0dd902-4e1f-4ea1-b16d-1e14458e2086	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	32eb200a-fb20-4d3a-aa6d-01d1a92c7ed1	ECONOMY	1661492.00	68
59db318b-1e0b-4685-9c14-1357f4267a5b	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c899f8b9-076b-4574-a94f-02880a0c8d44	ECONOMY	1378071.00	176
ea3bd421-b162-4475-bfd8-846e86cd429a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c899f8b9-076b-4574-a94f-02880a0c8d44	BUSINESS	2621988.00	26
6e0a609c-105f-41f2-aab9-dedb906e4ef5	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	dfb38f32-91b2-43d7-a0f0-eb8053d26bb8	ECONOMY	1432835.00	145
983fe6b0-33ee-41e9-a665-940ff0fd1bf6	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	dfb38f32-91b2-43d7-a0f0-eb8053d26bb8	BUSINESS	2952540.00	19
f6cea688-0880-4aca-aa82-9f4b6d80ca15	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	97dab713-6a32-449c-8962-58f54879b8bb	ECONOMY	1541683.00	232
2c341029-205c-4caf-9213-b3d2bf836e78	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	97dab713-6a32-449c-8962-58f54879b8bb	BUSINESS	3412982.00	31
0f77bbc8-bcd8-4269-89cd-910af6aa3810	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	353a5232-faa9-4d23-a56a-6e8961b4a77e	ECONOMY	2218249.00	169
0ccdd283-00ae-4115-bb53-4eb3b769689e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	353a5232-faa9-4d23-a56a-6e8961b4a77e	BUSINESS	3608353.00	16
35cf2dbd-249c-47b2-94e0-3e6c1b65e098	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	230edec8-08dd-4542-978f-446bce5d3480	ECONOMY	1488328.00	146
96a5c3a6-bac9-4d1e-b841-2b2307676f28	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	230edec8-08dd-4542-978f-446bce5d3480	BUSINESS	3833456.00	13
0864bfbe-0f8c-4fbe-8f75-64c5ba5c4b73	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	b3920b11-8b3f-4525-8c56-5b488932def0	ECONOMY	1894630.00	163
887216d1-3ae2-4362-84d8-c23eee5f4c61	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	b3920b11-8b3f-4525-8c56-5b488932def0	BUSINESS	3816907.00	23
beebbd8f-4385-4891-9316-f9c1ba1c9458	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	0720d50a-ea75-40d7-820e-0bbb2870b1c9	ECONOMY	1683517.00	196
c61563a5-94c4-4324-aaeb-9d43607bf1e3	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	0720d50a-ea75-40d7-820e-0bbb2870b1c9	BUSINESS	4555494.00	26
9c1276e3-c81a-4469-ab30-d9d9d2be55e5	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	afe6ba4a-c46d-4dd4-aa39-84d9c6850f69	ECONOMY	1965898.00	142
ad65a35d-d8bb-46ea-8168-1bb17e2dc49d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	afe6ba4a-c46d-4dd4-aa39-84d9c6850f69	BUSINESS	3796950.00	16
20fc3181-a886-487d-99e6-d49f924d21c5	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8e82d28d-eac3-4297-aedd-ec106eb50e36	ECONOMY	1956409.00	135
711a6489-809f-42a2-82d3-ad0b7a972fa1	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8e82d28d-eac3-4297-aedd-ec106eb50e36	BUSINESS	4111438.00	15
ee081dfc-58b7-4936-b0b4-2b1acb68fb15	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	de132a44-4cad-4f74-9790-0bdc66b49c21	ECONOMY	2592370.00	178
e5b5e08b-c217-43d3-81ce-50f758876997	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	de132a44-4cad-4f74-9790-0bdc66b49c21	BUSINESS	4905208.00	17
31d13ddf-1db1-4652-a345-2e96dc49d17e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	45227fff-bab8-4473-8a15-d834bd8a6728	ECONOMY	2171314.00	172
8b8dc88b-fa46-4529-b05c-402b12cc56af	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	45227fff-bab8-4473-8a15-d834bd8a6728	BUSINESS	4283391.00	18
28380bee-d70e-449d-a2b8-d584eb0e05b8	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4eb86899-800a-42a1-b4b7-b58ffc4c3cc3	ECONOMY	2117114.00	214
5cd60fc9-7abd-4d26-b5af-2c301afa9e64	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4eb86899-800a-42a1-b4b7-b58ffc4c3cc3	BUSINESS	4365925.00	36
56ef5538-bc4e-4e69-8ca0-bdc579252c28	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c7a42d42-135d-42d3-9197-305486cdb59f	ECONOMY	2247181.00	183
800c5382-b5dc-466b-9d7e-648f3186ace9	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c7a42d42-135d-42d3-9197-305486cdb59f	BUSINESS	3804165.00	18
8af031b0-21d0-4259-8ef4-9358a002deb1	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5d6133e9-a2c8-4266-a626-c4afcea8ecdd	ECONOMY	2931876.00	173
04847c29-3da7-42a6-862d-9bf3c668fbdb	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5d6133e9-a2c8-4266-a626-c4afcea8ecdd	BUSINESS	4736829.00	13
0b6c98f5-b8ba-4fad-9222-0ae563c7ea7b	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	78a5ef06-9ddd-4fdb-b599-168c79d59d51	ECONOMY	2061229.00	149
c79fbfc5-8dba-4b69-84f9-8b846583afa4	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	78a5ef06-9ddd-4fdb-b599-168c79d59d51	BUSINESS	3565697.00	22
61da166e-a0f4-4d99-b0a7-09b6e8e6417e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	35796b49-4844-4274-9084-3ab2d3862ae2	ECONOMY	2728333.00	161
59fb8688-615e-45d4-a71a-be5d43b0b2ff	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	35796b49-4844-4274-9084-3ab2d3862ae2	BUSINESS	5503771.00	12
d2bc07b7-36f2-4969-a3a9-137653c28845	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e3b34a0b-cdff-4a70-a8be-2f80251312d3	ECONOMY	2227603.00	69
12d8e7ba-2380-4963-9fe9-e323f8e9f6b4	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	d89123f1-a711-4d78-bf54-70aa45397f7a	ECONOMY	1942117.00	175
b0ac3bcb-22ab-4dba-b8f2-6fb941291787	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	d89123f1-a711-4d78-bf54-70aa45397f7a	BUSINESS	5207348.00	18
3585f6dd-edd4-4fe5-8269-da85f14c4449	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	ca909eda-d6e2-46eb-b084-bb4f7ac07416	ECONOMY	2369155.00	53
00512380-b4ec-4164-8954-4e0e326f4c96	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	d205cf35-b822-4121-8628-0dd44db3cb04	ECONOMY	1682093.00	168
372a33ee-6b3d-4ea1-ab3e-3b852c0c8780	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	d205cf35-b822-4121-8628-0dd44db3cb04	BUSINESS	4084678.00	16
9936857b-f30e-44e1-b4f3-69d1061e2da8	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	a3015bdf-1863-4705-8a25-12ff8485c9a8	ECONOMY	2736255.00	186
cb526df6-57c7-4288-a874-e9a1b2babf50	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	a3015bdf-1863-4705-8a25-12ff8485c9a8	BUSINESS	4961364.00	17
cf52f9f6-6b91-4553-950d-ae5aad0fb85c	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	42785bd3-3c56-4c67-b35f-398a540f3bb4	ECONOMY	2606831.00	167
ee1f24c1-33fe-4549-86dc-1e492a32a2f4	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	42785bd3-3c56-4c67-b35f-398a540f3bb4	BUSINESS	5759099.00	21
28344397-be54-4080-bc11-4debac4253e9	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	1240bc63-cdfa-42d7-9895-f26fc424f8c5	ECONOMY	2475331.00	53
209c9bb4-49de-441f-9700-34c7004ac5ec	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	bd7b0df6-ec0a-4e86-af7b-29e48b6ca8eb	ECONOMY	2607030.00	203
6c3d9585-2a7e-4672-a12a-e2ca96fa62e2	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	bd7b0df6-ec0a-4e86-af7b-29e48b6ca8eb	BUSINESS	5419285.00	39
ef6f27ef-a724-4f02-bb7b-a3bd88924f67	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6f14a09a-e8db-4e1a-b5ed-cf01b40f4780	ECONOMY	2391444.00	211
6f9ce3df-8c40-4cef-8329-3136e587cf13	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6f14a09a-e8db-4e1a-b5ed-cf01b40f4780	BUSINESS	4091471.00	31
e955f8ee-4697-4099-9a80-d1a42389507b	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	08a3ed3a-26df-40a5-a1f2-299e099104f7	ECONOMY	1900125.00	62
56484dbf-f957-485e-884f-e258011776db	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6b13b8cf-a2c9-4d87-bf1d-bef5d9affd0f	ECONOMY	2922425.00	185
bbea1527-8aeb-4d2f-9f48-cb58ceb7a1a0	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6b13b8cf-a2c9-4d87-bf1d-bef5d9affd0f	BUSINESS	4774273.00	26
3733cfec-535c-4a1e-9b0c-ed2fac4792cf	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	89dc06e3-9448-4742-a525-89558f4b0c33	ECONOMY	2870254.00	195
800d851f-1263-4284-90f0-1341aaae6d25	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	89dc06e3-9448-4742-a525-89558f4b0c33	BUSINESS	5246338.00	18
9b2efe3e-9c0a-4459-820b-f9842954c5d3	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	fc693ee5-cbe1-41f9-84dc-133bfddcf8cd	ECONOMY	1973249.00	54
8a27e37a-5155-42fa-8626-e9154f745921	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	226390e6-17dd-47ed-9b76-8471a797a22b	ECONOMY	1975922.00	202
a04f197c-d67a-4cf8-80b6-1a23b5485de5	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	226390e6-17dd-47ed-9b76-8471a797a22b	BUSINESS	4900912.00	25
2fe56eed-d3e4-4905-83a1-06ad029afd2c	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	664cd326-c67c-4949-b3c6-8c10eb56105f	ECONOMY	3080426.00	167
f728028e-e4fa-4fea-83ce-21bae5910e2b	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	664cd326-c67c-4949-b3c6-8c10eb56105f	BUSINESS	6049131.00	26
778a0688-8c62-4b4c-8dd9-a61478209d96	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	448c2bc4-24bc-44d4-bcdc-79478e480247	ECONOMY	2107591.00	58
bac182e5-988b-48d1-843e-eb462bac97d9	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	57adc25e-b219-4579-9cb4-efcb245d9f90	ECONOMY	3466427.00	66
5578e496-67e3-4d20-94f2-d3758ce7c567	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e9d4454e-2527-4bd8-93cc-1177b7ac6636	ECONOMY	2582390.00	198
02ec5e6d-0d70-4f58-a4d0-b25da44b764a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e9d4454e-2527-4bd8-93cc-1177b7ac6636	BUSINESS	4976147.00	20
3e2e5bdb-ca8d-46dd-871c-cb56fbd8fb68	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	dfb5a137-e922-4825-8904-5d86d1e147c9	ECONOMY	2925517.00	184
4fb0b01f-5284-4536-ae7b-213dbc99a00f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	dfb5a137-e922-4825-8904-5d86d1e147c9	BUSINESS	5218008.00	27
a785e281-d399-4daa-a432-f376a1fc7dbc	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	bb1e3926-297c-4f0a-9e74-5583037c1633	ECONOMY	2673229.00	178
74819f05-5e73-4816-94cb-235ceff0f30e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	bb1e3926-297c-4f0a-9e74-5583037c1633	BUSINESS	4810386.00	16
dc705dce-0885-4074-90db-3a853f13f1e6	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2c688b89-f145-4a24-be84-abb302652b10	ECONOMY	2928320.00	156
113578aa-01af-4f7f-b4db-b58964e805d7	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2c688b89-f145-4a24-be84-abb302652b10	BUSINESS	5224973.00	20
290ccc5f-9519-4c65-ba53-105a8b50abb3	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	cc9ad8e9-87b5-48e9-b43b-cf2597a77aa0	ECONOMY	3046317.00	151
4d73d74f-b4af-4e02-9137-746f4209a6c7	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	cc9ad8e9-87b5-48e9-b43b-cf2597a77aa0	BUSINESS	6095096.00	15
78a9f076-9f40-41e3-bc3e-acf975cd40c8	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	efaa48ef-00c2-4469-8765-9f670a8d521e	ECONOMY	2250469.00	62
b59ac7bf-6846-42bf-a920-93f3076fa1df	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2712185e-a7ec-4910-9df3-31fc29811d02	ECONOMY	2435425.00	153
cab15b95-8101-4b1a-857a-17d2d0082735	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2712185e-a7ec-4910-9df3-31fc29811d02	BUSINESS	3907766.00	21
76028911-c7a6-4a7c-9ae1-28a0f4483e86	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3abc57cb-1558-4555-af99-46f2a2e99498	ECONOMY	1962220.00	63
a8d691d5-8be4-485e-85ea-7faf67504ba9	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4c505854-982d-4dc7-aeef-858fd4d7b6e1	ECONOMY	2226386.00	164
a0de5038-42d2-419f-9b80-d94d83fb0c56	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4c505854-982d-4dc7-aeef-858fd4d7b6e1	BUSINESS	5037762.00	17
55b291bc-708f-40be-b64c-08df7ee9df72	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8d715126-84de-47cd-981c-bbf1fe770e1b	ECONOMY	2992624.00	159
bae9a389-da46-4226-a09f-33a2ea359817	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8d715126-84de-47cd-981c-bbf1fe770e1b	BUSINESS	5836154.00	14
55f97db8-d970-4eae-a37e-5dba38b281d2	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e93a029e-261a-4a8d-9092-046dedfa41b8	ECONOMY	3029791.00	170
8f9c2492-909a-413a-8631-fdbe026fee9e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e93a029e-261a-4a8d-9092-046dedfa41b8	BUSINESS	5357194.00	23
3dde8c2c-8532-4cc6-babb-1fe47021dbef	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e36db64e-144b-4947-8767-2a9eb3bc1a4b	ECONOMY	3056995.00	243
1a22ef29-b2b0-4c22-aac9-04c81da159f0	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e36db64e-144b-4947-8767-2a9eb3bc1a4b	BUSINESS	5359028.00	32
79ca4f6e-5f28-40df-a585-b21a78e74bf1	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3bde3874-71b2-49af-adb4-a807ebd8562b	ECONOMY	3021577.00	153
d3cab929-63b1-4198-bfb4-6d4e1d6e5ced	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3bde3874-71b2-49af-adb4-a807ebd8562b	BUSINESS	5871635.00	16
5ee6416f-e144-453b-85af-857661672f78	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	feed2efd-08dd-458f-b628-1d46aa8aab40	ECONOMY	2935120.00	53
debd220c-27a2-444b-bdba-3b76f1ed81e3	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2d6651a2-1c13-4d35-bfbf-9435dc34fb2f	ECONOMY	2110300.00	172
a98bb869-d7b5-4acc-aec6-67d86dd6a28f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2d6651a2-1c13-4d35-bfbf-9435dc34fb2f	BUSINESS	5437091.00	19
59d6f60f-d5f6-497f-b553-fb060903a68a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	49c862d2-1f7c-49d6-b5bd-687839564acf	ECONOMY	3404027.00	152
4c2d7ec2-0df4-41b1-9b1c-9aadb20f3fb8	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	49c862d2-1f7c-49d6-b5bd-687839564acf	BUSINESS	6240080.00	18
adfd0018-39d8-4ef4-b4fa-f74498fbf3be	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c3896e91-ce06-4e32-a6c5-e80190693d21	ECONOMY	2598189.00	155
7b430f8b-e495-464a-8099-50c994e859fd	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c3896e91-ce06-4e32-a6c5-e80190693d21	BUSINESS	5432922.00	12
3b849d86-20a4-46d7-af91-f3fe1d8ce06d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	82b0cf8e-3e21-478a-bede-796ab1b8bdc8	ECONOMY	3421424.00	170
9d074869-85aa-4bf2-871c-54508abb7a3f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	82b0cf8e-3e21-478a-bede-796ab1b8bdc8	BUSINESS	5855442.00	15
87000a8b-eb5f-4be9-9450-a01816be66a0	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6198ffc0-1f55-409d-8968-3508403d2dc8	ECONOMY	2216532.00	122
40da58f4-7d91-4de1-8fb5-795c23231c53	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6198ffc0-1f55-409d-8968-3508403d2dc8	BUSINESS	5912315.00	15
61ad4ef1-7d1e-491d-b63d-9b7ff5fa32ae	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	b833bba3-11ea-4f30-ad1f-9b609ce84b0a	ECONOMY	3098725.00	142
7a7d43a8-13b8-465d-a55f-139baf72308d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	b833bba3-11ea-4f30-ad1f-9b609ce84b0a	BUSINESS	5904682.00	13
302c681c-b5a4-42e2-be52-a54f6dd4a688	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	f5b3ac92-c31e-4551-9c7f-01b6b079f640	ECONOMY	3380451.00	168
4417d6bc-f887-4894-80a5-138d2451549a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	f5b3ac92-c31e-4551-9c7f-01b6b079f640	BUSINESS	6217082.00	15
6d9d9df5-a0ca-46b2-a63d-cee49d43719d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2e29af00-b151-42a3-82f2-cc19b2d01300	ECONOMY	3149203.00	65
33b55330-94b2-44f5-9621-f13f32699bde	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	82c4cffc-d722-48d8-bba2-bcbd319244c6	ECONOMY	2617397.00	173
4713d879-87c6-4126-b0bb-4756a46077bd	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	82c4cffc-d722-48d8-bba2-bcbd319244c6	BUSINESS	4249713.00	16
6416b98e-71c3-4fcc-9604-874fb73ee0ba	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	87d069cd-c8b0-4a1c-9dd3-0fd8a55a75ee	ECONOMY	3119585.00	152
938ff0ad-710f-4e96-89bc-54dc9c241aca	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	87d069cd-c8b0-4a1c-9dd3-0fd8a55a75ee	BUSINESS	6193831.00	19
df339113-25e1-479b-880d-7088688172dd	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c618224d-4176-4738-86ce-3bd34d453d8e	ECONOMY	3091967.00	178
fd8a36a6-6e0d-46b7-9cd7-bcddf311b5c1	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c618224d-4176-4738-86ce-3bd34d453d8e	BUSINESS	6166772.00	19
b8b9d05b-6eaf-4755-b9cd-48a5299af117	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	ecf15915-d023-4df8-ac2a-75b84b11eb07	ECONOMY	2607996.00	185
715471d9-b080-4ffd-bb05-a2612cd32332	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	ecf15915-d023-4df8-ac2a-75b84b11eb07	BUSINESS	5262740.00	24
22909feb-2e03-4b0c-8cf9-bd83260419df	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5ef047f2-248c-4056-8f3a-387fa42291fe	ECONOMY	2556356.00	162
50c8bf3d-712d-4ddd-b2cb-7c2533bb06ac	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5ef047f2-248c-4056-8f3a-387fa42291fe	BUSINESS	6033668.00	25
40ff06b2-6cc3-4295-9fbb-e581fde453a9	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	fecba931-3570-4571-a0e0-d35561d04ca6	ECONOMY	2376185.00	157
c7aadc9f-4306-461e-afb8-2ed9e15ec819	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	fecba931-3570-4571-a0e0-d35561d04ca6	BUSINESS	4871677.00	12
52e4cfb7-420b-4e8c-a475-079f2f9653ae	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	b8fe90b2-91ee-4c8d-83c6-8c7f2cb9d4e0	ECONOMY	2032200.00	184
0648cb4c-66b7-4aa2-8dae-3e728b69b309	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	b8fe90b2-91ee-4c8d-83c6-8c7f2cb9d4e0	BUSINESS	4596276.00	27
544c1a43-757f-4433-a68b-abf08a68a85f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	07512726-4707-44ea-81f7-cde2ac67dcec	ECONOMY	1889606.00	154
6404e8ff-5813-4ca7-9bf3-15ad806bdce3	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	07512726-4707-44ea-81f7-cde2ac67dcec	BUSINESS	3872688.00	18
f15cb3a4-6b44-4634-87dd-fb55063c9950	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5a1505bf-f79c-4b84-a1cd-fd505f80bfc4	ECONOMY	1636024.00	130
7f67e37c-f267-4b1a-825e-e9da7f18acd2	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5a1505bf-f79c-4b84-a1cd-fd505f80bfc4	BUSINESS	3995326.00	22
f85c6dcc-7999-4c16-a31d-3b67cb635781	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	35d8991d-9caa-4d53-b9b8-ab48ba4ed808	ECONOMY	2287287.00	213
e4340209-b8af-4325-9ee4-5b8fad984db1	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	35d8991d-9caa-4d53-b9b8-ab48ba4ed808	BUSINESS	3527617.00	39
fdfe5d59-2d15-46e1-97e9-6000506dd86a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	0aea8232-7bc6-4a91-b6d4-c4cf5510432f	ECONOMY	1456888.00	166
619b9f7c-0010-4e13-be53-31848025347f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	0aea8232-7bc6-4a91-b6d4-c4cf5510432f	BUSINESS	4038360.00	19
827d7ee6-9bc4-4246-973b-735f474ba941	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8a0bf920-ccf3-4c7f-89b5-b3392c147e4a	ECONOMY	1607866.00	178
66776586-318f-406c-903c-f5c1e6f4806e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8a0bf920-ccf3-4c7f-89b5-b3392c147e4a	BUSINESS	3741694.00	17
f91cfd29-8da1-4c9e-9a65-23de0be8dcaa	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5524a3be-cc03-4417-b813-300b69348173	ECONOMY	1740766.00	192
f1099550-4dca-4afe-9e10-247f859e256c	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5524a3be-cc03-4417-b813-300b69348173	BUSINESS	3545126.00	25
d87e637c-f16a-446a-ace4-29778c70446b	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	67a728da-d100-4ebd-8bfb-f07856b6798e	ECONOMY	2315431.00	222
410ff3a3-cc44-4e7f-9bda-ab2edbb58569	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	67a728da-d100-4ebd-8bfb-f07856b6798e	BUSINESS	4006715.00	37
41eaf4bf-0cf3-4247-91d2-6eaadea368b6	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	d2c510fd-04a7-45f3-b6dc-e819f235bc80	ECONOMY	1802730.00	65
4bc4f85f-afd6-4295-b35a-5242537cc489	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2d06e37b-c1ff-4ad1-ace0-075dca6ec67b	ECONOMY	1797402.00	212
164917c0-7bc5-485b-ab3e-d6ddcc3e8835	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2d06e37b-c1ff-4ad1-ace0-075dca6ec67b	BUSINESS	4545197.00	34
15727887-55c4-48d4-9919-ecb987c8f899	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	88375f85-70dd-4c55-a7e2-4db61228cbff	ECONOMY	1482857.00	166
8314a598-6efd-41ac-95e9-5b9b9d55265d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	88375f85-70dd-4c55-a7e2-4db61228cbff	BUSINESS	3523603.00	28
0d1af185-5955-4eea-9e5e-ff2cc29aa20d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4abcd249-eec3-4b59-96de-93417868af6b	ECONOMY	1535905.00	164
71e16020-a3a4-4a61-9ca4-706b4dbb95fa	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4abcd249-eec3-4b59-96de-93417868af6b	BUSINESS	3170273.00	24
56e818f0-3c5c-4153-909e-8374f3392796	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	0161bb89-51ac-4a98-aebf-240aa778d96e	ECONOMY	1667849.00	170
e7b00e48-02db-4e2c-9d70-637036baefb9	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	0161bb89-51ac-4a98-aebf-240aa778d96e	BUSINESS	4076795.00	16
d527ef13-ddc6-4bef-8733-75ea31d8a3c0	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	fc3de250-137e-4318-9cba-557dfefb9ba6	ECONOMY	1692352.00	169
f14769e4-2a9b-43c8-afc3-da127da971fe	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	fc3de250-137e-4318-9cba-557dfefb9ba6	BUSINESS	3200758.00	15
063e6bac-52c1-4853-86ec-2c9186aa5c91	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e5834fea-e60f-41fa-b3db-274308b14266	ECONOMY	1217217.00	55
2e61b56b-0204-4ba7-b17b-6834de23998c	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	da8d656d-1939-4075-aa54-371b772439d2	ECONOMY	1608033.00	178
be5fe438-4d3c-4a2b-afab-646b211bdd08	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	da8d656d-1939-4075-aa54-371b772439d2	BUSINESS	3803484.00	27
cba0858c-9d10-453c-9c30-37699a770241	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	06ca1c92-76ce-48af-b0f0-2eebb5c97f61	ECONOMY	1756768.00	165
9d73d8a4-d8ce-4501-bb08-f9162763077d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	06ca1c92-76ce-48af-b0f0-2eebb5c97f61	BUSINESS	3351257.00	25
b3e0ffdb-9ab0-4d7b-8d14-13b7241c6649	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	500588f3-2e44-43ab-95d0-31526241f1c5	ECONOMY	1992887.00	223
70beb9ae-5652-4c42-808d-2f08906ca8ea	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	500588f3-2e44-43ab-95d0-31526241f1c5	BUSINESS	4486543.00	29
676d1169-2726-48d4-9688-b6ae295da7bd	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3470daab-f56a-44b1-9289-69795893ed86	ECONOMY	2234117.00	179
5a1e34e7-b864-4940-acb8-cf0a9823c95b	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3470daab-f56a-44b1-9289-69795893ed86	BUSINESS	3762606.00	17
1ce7c78f-e10a-42c4-9f58-10255019e353	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	ea297952-1bad-43af-b201-2938413f3330	ECONOMY	1921758.00	169
8986d260-6295-48f9-87c9-86f66735c725	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	ea297952-1bad-43af-b201-2938413f3330	BUSINESS	3649675.00	15
c817f252-9ed8-4f24-9a66-2a0a08e78eef	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7784fa37-c95a-46fd-881b-bdecf7167055	ECONOMY	1296220.00	155
46d281ac-2e3f-478b-9498-09adf6397f08	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7784fa37-c95a-46fd-881b-bdecf7167055	BUSINESS	3179288.00	17
d0a2f604-3346-4a5e-b727-094128891e41	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	14af8ad4-e422-46ae-8eff-fcfd14ff76d0	ECONOMY	1982393.00	50
7b7cc7a0-ba22-4c7f-a9c6-f386d01773ef	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	551d0bf0-3d49-4255-b473-a2e47190b91c	ECONOMY	1333507.00	222
248a8f8a-cde4-4369-87ae-ae2439628f11	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	551d0bf0-3d49-4255-b473-a2e47190b91c	BUSINESS	2887136.00	34
a8faf784-3546-4005-b856-ddfde9f5e676	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	d90b9025-914a-43d8-8bf9-3960bb0e7743	ECONOMY	2114295.00	159
d01bf878-649c-433f-b6cc-625c67e9304f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	d90b9025-914a-43d8-8bf9-3960bb0e7743	BUSINESS	4117034.00	26
ba17b675-c7c6-4a31-a00f-8703212a3fa8	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	afb74a60-1fed-44c4-b52d-078bf07f0be7	ECONOMY	1824652.00	240
b907831a-7d12-44ee-9f4b-691dd8bb5966	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	afb74a60-1fed-44c4-b52d-078bf07f0be7	BUSINESS	3541838.00	37
480e6588-24bf-4b8a-b2a7-06577f9400aa	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8cc0b7b4-fd85-4085-9a20-6e9dd24c9995	ECONOMY	2393147.00	245
e33c37c2-d260-4621-a08e-c27298f9b954	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8cc0b7b4-fd85-4085-9a20-6e9dd24c9995	BUSINESS	4489427.00	24
2fa17a55-0cfb-4074-81c5-7eb247e0ed81	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	b5f7c560-cb9a-46c5-bea1-196b2aecd0a2	ECONOMY	1587414.00	143
b0113734-473c-4110-81d3-694d8a9e770a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	b5f7c560-cb9a-46c5-bea1-196b2aecd0a2	BUSINESS	2678582.00	28
d7dc06d1-edd4-4e4f-9fb9-60cd6a894c91	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	f8808566-7bc1-4351-9bad-109ee4e6f869	ECONOMY	1511053.00	55
a9ee344a-5e5e-4be8-a280-c431174b0897	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	940efa7b-ad8d-4f29-a371-21cc359f96c7	ECONOMY	2015238.00	154
843dc552-c013-4113-b275-54d0df0b4559	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	940efa7b-ad8d-4f29-a371-21cc359f96c7	BUSINESS	3653661.00	22
6790bdac-d196-4f2a-a925-5d33c8fd7e30	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7191adcd-34d5-49c6-87ff-111e31727947	ECONOMY	2053197.00	143
246fa847-89f6-4d1f-87b3-373c20235095	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7191adcd-34d5-49c6-87ff-111e31727947	BUSINESS	4188449.00	15
f765cca1-38df-4e41-acd4-6959c8708a03	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8ea7efb4-1296-40b4-bb62-ac3255580c57	ECONOMY	2117903.00	68
e83d1064-9bd3-4e5f-9ea5-e09169d57797	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c0d3d813-c563-4c78-9371-b8cd6d84972b	ECONOMY	2016431.00	64
c968e0a9-57ba-41b2-b443-625eafe42974	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	117d83ca-030d-4d51-b5b6-938a113385bb	ECONOMY	2449431.00	240
98d4989b-bba0-4525-b7c3-c8e9a8aa936f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	117d83ca-030d-4d51-b5b6-938a113385bb	BUSINESS	3820996.00	36
d38535b1-9ee3-45c6-9480-6abb0c0cfb21	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	864b725d-43ff-4dd4-92da-5bdf219a274f	ECONOMY	2348137.00	237
7ba6eeb1-32ab-4ea4-91f4-3743dec8acf1	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	864b725d-43ff-4dd4-92da-5bdf219a274f	BUSINESS	3543912.00	31
bd08007d-7e43-4870-82e8-df0c40e372bd	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	a7735a14-25a3-4792-8e42-65374524b896	ECONOMY	2373618.00	148
53163c45-ce6c-4015-83b7-5e233af5db4e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	a7735a14-25a3-4792-8e42-65374524b896	BUSINESS	4210486.00	14
ad9dbc7d-10cd-4844-a5f3-cbb0efb7f715	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	a1674d48-bd1b-489e-8141-cfd480e837e6	ECONOMY	2019995.00	140
cdc93534-b49e-4e1a-853f-91bd160cc614	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	a1674d48-bd1b-489e-8141-cfd480e837e6	BUSINESS	3937923.00	13
9dd6022c-9ac9-4f2e-8fb5-497a8d1f26eb	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	bcb73380-db6a-4000-a45f-84c76c804c5c	ECONOMY	2197099.00	184
e9f3c8d6-21b1-4e39-b03d-4f31fefda509	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	bcb73380-db6a-4000-a45f-84c76c804c5c	BUSINESS	4263170.00	26
ecf0262c-2553-43a3-81a5-9f5e473ce601	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c0253d8c-8dc1-434e-9a48-d3707d8e5bb2	ECONOMY	2018605.00	53
06468f72-5724-4412-a4ca-ac039105ea35	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3467d4c8-ea50-4193-8614-cf58c24028e3	ECONOMY	2174961.00	67
d05e3b5f-91ba-4280-b17c-b8045b2cc23a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	00268a2d-a84e-4686-864a-513d3c7669d5	ECONOMY	2335415.00	225
ca6c5478-c73c-42e9-a9b0-87a4b2ae9637	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	00268a2d-a84e-4686-864a-513d3c7669d5	BUSINESS	4729671.00	39
c1f25a37-f5e5-47f9-845e-0e35e203d5ab	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	c0d38813-0c94-4a26-9f68-ca73fb99dc05	ECONOMY	2136695.00	59
992e4d3f-8e94-4ca3-ad9a-39ca3adacb9e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	b9ed12d0-3a2f-43fd-8152-f4c9d2c215c8	ECONOMY	2182595.00	170
978cab3a-d8bb-462b-ae98-8b78a2ac8aec	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	b9ed12d0-3a2f-43fd-8152-f4c9d2c215c8	BUSINESS	4008288.00	17
6352b3f1-1d9e-488b-ac36-69ad9b71b18e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	eb241904-9028-4814-9c0c-4af7ab19607d	ECONOMY	1934089.00	165
8a98a20b-fec9-4547-be31-4d37032ea090	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	eb241904-9028-4814-9c0c-4af7ab19607d	BUSINESS	4296831.00	26
3b025bac-18cd-4533-9446-f4e9782f3353	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	b96fbc94-8b78-497e-9241-cde4b50d4ff1	ECONOMY	2037635.00	53
e3b95557-e066-4323-a183-8f0919c58809	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e4e3c1c2-201e-4712-a4fb-35dd8011db05	ECONOMY	2492230.00	172
4ed36c7e-46dc-482a-a221-5f164adbb409	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	e4e3c1c2-201e-4712-a4fb-35dd8011db05	BUSINESS	3559354.00	19
8102f1b4-09d3-4bd5-bc34-b44dd211626f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9ec917af-1aba-488f-a8dc-37834c5f8f91	ECONOMY	2124513.00	175
d553e1a0-07ed-42ed-a1a1-7880cd689e37	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9ec917af-1aba-488f-a8dc-37834c5f8f91	BUSINESS	4855474.00	17
724e562d-9999-49d7-9fb3-2de54df25f46	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	0c948ebf-4c39-4d9c-972b-3bd1e40e0677	ECONOMY	2661465.00	61
b3cc523e-9781-43e8-83cf-2c9f21bc9167	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5ce1a6b9-be15-449f-8166-9c60e90ffd46	ECONOMY	2850672.00	207
c5ad1555-c371-4e84-bf9b-d1307a4467a8	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5ce1a6b9-be15-449f-8166-9c60e90ffd46	BUSINESS	5721555.00	39
\.


--
-- TOC entry 3480 (class 0 OID 58007)
-- Dependencies: 227
-- Data for Name: flight_outbox_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flight_outbox_events (id, aggregate_type, aggregate_id, event_type, payload, created_at) FROM stdin;
\.


--
-- TOC entry 3477 (class 0 OID 57925)
-- Dependencies: 224
-- Data for Name: flight_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flight_schedules (schedule_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by, flight_id, departure_time, arrival_time, aircraft_type, status, aircraft_id) FROM stdin;
335498ba-0230-41f7-9569-a3e5195ac6b3	2025-09-13 09:32:39.915106	1c544260-57c6-4e63-ba65-9a529f3783a2	2025-09-13 09:33:16.468012	1c544260-57c6-4e63-ba65-9a529f3783a2	t	2025-09-13 09:33:16.457653	\N	19	2025-09-14 01:50:00	2025-09-14 04:31:00	767	SCHEDULED	9
0c948ebf-4c39-4d9c-972b-3bd1e40e0677	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	24	2025-07-10 09:20:00	2025-07-10 10:55:00	ATR 72	SCHEDULED	15
5ce1a6b9-be15-449f-8166-9c60e90ffd46	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	24	2025-07-10 07:30:00	2025-07-10 09:05:00	Boeing 787	SCHEDULED	11
e4f210ef-9efb-423a-9d54-c6486d5d382b	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	1	2025-07-13 06:00:00	2025-07-13 08:05:00	Airbus A321	SCHEDULED	3
adad7f55-0ec0-49d1-81d3-161c5a0e4d69	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	1	2025-07-13 09:00:00	2025-07-13 11:05:00	Airbus A321	SCHEDULED	3
4b4b74b6-f045-4b37-8440-6422a6e58ee4	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	1	2025-07-13 12:00:00	2025-07-13 14:05:00	Airbus A321	SCHEDULED	3
5cccf7cb-b195-461b-948c-23a53a2c685a	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	1	2025-07-13 15:00:00	2025-07-13 17:05:00	Airbus A321	SCHEDULED	3
7a80f891-8a3b-4e99-9776-0442fdf0bc59	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	1	2025-07-13 18:00:00	2025-07-13 20:05:00	Airbus A321	SCHEDULED	3
77a19ab7-725f-4788-80dc-1d994a76fbcb	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	1	2025-07-13 21:00:00	2025-07-13 23:05:00	Airbus A321	SCHEDULED	3
1c6cc922-d949-40e3-99a9-4ca761febf27	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	1	2025-07-14 06:00:00	2025-07-14 08:05:00	Airbus A321	SCHEDULED	3
6055efcb-04a1-479a-b006-d5dd8fc35f6a	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	1	2025-07-14 09:00:00	2025-07-14 11:05:00	Airbus A321	SCHEDULED	3
1ca90f29-8602-456e-bce0-55b0747643cf	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	1	2025-07-14 12:00:00	2025-07-14 14:05:00	Airbus A321	SCHEDULED	3
1b91aebc-c600-4733-b497-d4d09ca02712	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	1	2025-07-14 15:00:00	2025-07-14 17:05:00	Airbus A321	SCHEDULED	3
82056e4c-3629-457f-ae94-5415a1d118ec	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	1	2025-07-14 18:00:00	2025-07-14 20:05:00	Airbus A321	SCHEDULED	3
ef983d3e-046e-417d-8fb2-e8390791d7d0	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	1	2025-07-14 21:00:00	2025-07-14 23:05:00	Airbus A321	SCHEDULED	3
49d0251c-4146-422e-8dc0-f8b22fb9b3da	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	2	2025-07-13 06:00:00	2025-07-13 08:05:00	Airbus A321	SCHEDULED	3
2e74f69c-7b4f-47e0-bc31-a8aafab6cd65	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	2	2025-07-13 09:00:00	2025-07-13 11:05:00	Airbus A321	SCHEDULED	3
c3d6e2d6-9ed7-4e22-8581-b796e843ccbb	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	2	2025-07-13 12:00:00	2025-07-13 14:05:00	Airbus A321	SCHEDULED	3
2cf40d1c-4641-454d-b2f0-d523e0f0a2d4	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	2	2025-07-13 15:00:00	2025-07-13 17:05:00	Airbus A321	SCHEDULED	3
e9f3cefd-d6d8-49d5-b5cf-8236592fcbf2	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	2	2025-07-13 18:00:00	2025-07-13 20:05:00	Airbus A321	SCHEDULED	3
5d468d28-569f-44df-8cea-02f28ea0b6b5	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	2	2025-07-13 21:00:00	2025-07-13 23:05:00	Airbus A321	SCHEDULED	3
4e679a44-24f9-43dc-a075-19805a1a0638	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	2	2025-07-14 06:00:00	2025-07-14 08:05:00	Airbus A321	SCHEDULED	3
b708ce6f-51c0-4085-b75a-5b50f062ad60	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	2	2025-07-14 09:00:00	2025-07-14 11:05:00	Airbus A321	SCHEDULED	3
d5d15872-bcef-4617-997e-4ef6e99729a3	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	2	2025-07-14 12:00:00	2025-07-14 14:05:00	Airbus A321	SCHEDULED	3
5c6ae573-44bc-4814-965e-96fd20b9f876	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	2	2025-07-14 15:00:00	2025-07-14 17:05:00	Airbus A321	SCHEDULED	3
63c6ffed-4618-4fe8-a6e6-5cbf2772599c	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	2	2025-07-14 18:00:00	2025-07-14 20:05:00	Airbus A321	SCHEDULED	3
2f64a3ce-8845-4055-8dc1-1ab2d8d21e3a	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	2	2025-07-14 21:00:00	2025-07-14 23:05:00	Airbus A321	SCHEDULED	3
1fa2c374-4476-4cfc-bd62-28a54ee8fe03	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	3	2025-07-13 06:00:00	2025-07-13 07:20:00	Airbus A321	SCHEDULED	3
abb25f44-c10e-457c-8f7b-b12ebf87ac5e	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	3	2025-07-13 09:00:00	2025-07-13 10:20:00	Airbus A321	SCHEDULED	3
8886d033-c6c0-45bc-b54c-8934886a4637	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	3	2025-07-13 12:00:00	2025-07-13 13:20:00	Airbus A321	SCHEDULED	3
c60fbdd7-1eb7-498b-9adb-17e1395fcee0	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	3	2025-07-13 15:00:00	2025-07-13 16:20:00	Airbus A321	SCHEDULED	3
cd43c38d-d6ee-49c3-a530-1fe8957cd63a	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	3	2025-07-13 18:00:00	2025-07-13 19:20:00	Airbus A321	SCHEDULED	3
481ea446-3111-4637-8bdb-27bf93d7c0fd	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	3	2025-07-13 21:00:00	2025-07-13 22:20:00	Airbus A321	SCHEDULED	3
344d3629-6603-439d-a7bc-9350868cfeed	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	3	2025-07-14 06:00:00	2025-07-14 07:20:00	Airbus A321	SCHEDULED	3
c000dfeb-6468-4ac1-a74d-4618889603f0	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	3	2025-07-14 09:00:00	2025-07-14 10:20:00	Airbus A321	SCHEDULED	3
46820c8c-10d8-4536-9888-fa1751aee833	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	3	2025-07-14 12:00:00	2025-07-14 13:20:00	Airbus A321	SCHEDULED	3
afd802c9-8ba1-483a-9f9b-cbc701459258	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	3	2025-07-14 15:00:00	2025-07-14 16:20:00	Airbus A321	SCHEDULED	3
44b0b5e2-a950-407c-bb34-9efc21d20d1f	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	3	2025-07-14 18:00:00	2025-07-14 19:20:00	Airbus A321	SCHEDULED	3
6ced6d21-6a28-444e-832e-b19ebe3f5bf1	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	3	2025-07-14 21:00:00	2025-07-14 22:20:00	Airbus A321	SCHEDULED	3
fa94f2ee-869d-4c5e-9f73-02d638186779	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	4	2025-07-13 06:00:00	2025-07-13 07:20:00	Airbus A321	SCHEDULED	3
c8e85d10-16f9-4ab5-80c7-b9e9629a4cc3	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	4	2025-07-13 09:00:00	2025-07-13 10:20:00	Airbus A321	SCHEDULED	3
73def88e-d464-4c1e-9d63-8bafe2a97d7f	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	4	2025-07-13 12:00:00	2025-07-13 13:20:00	Airbus A321	SCHEDULED	3
d3832ee1-3588-469e-bf88-207b9e1ceae0	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	4	2025-07-13 15:00:00	2025-07-13 16:20:00	Airbus A321	SCHEDULED	3
825df2fb-a903-4e7f-a1d3-1eac224140f6	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	4	2025-07-13 18:00:00	2025-07-13 19:20:00	Airbus A321	SCHEDULED	3
f4d7425c-3cc0-4e46-9cb0-d9b24c736a24	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	4	2025-07-13 21:00:00	2025-07-13 22:20:00	Airbus A321	SCHEDULED	3
0f908d46-9a44-421d-ac54-327292fcb60b	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	4	2025-07-14 06:00:00	2025-07-14 07:20:00	Airbus A321	SCHEDULED	3
1f88ef53-47f9-4a31-aa4e-7d1047bc02f9	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	4	2025-07-14 09:00:00	2025-07-14 10:20:00	Airbus A321	SCHEDULED	3
bc02a6e3-f356-4d62-977c-c00652d9b2d3	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	4	2025-07-14 12:00:00	2025-07-14 13:20:00	Airbus A321	SCHEDULED	3
49115230-1f0e-4178-a09d-5b0812cfa50d	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	4	2025-07-14 15:00:00	2025-07-14 16:20:00	Airbus A321	SCHEDULED	3
ffde1176-7d26-4e2b-bf26-591a34fa4a94	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	4	2025-07-14 18:00:00	2025-07-14 19:20:00	Airbus A321	SCHEDULED	3
d1713393-4660-41d0-ba04-e394f61ebc2b	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	4	2025-07-14 21:00:00	2025-07-14 22:20:00	Airbus A321	SCHEDULED	3
4d18f9a7-95b2-4e3a-81fa-88b22cfa6e31	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	5	2025-07-13 06:00:00	2025-07-13 07:35:00	Airbus A321	SCHEDULED	3
e4426763-5052-4e60-90c0-84fcacf7f405	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	5	2025-07-13 09:00:00	2025-07-13 10:35:00	Airbus A321	SCHEDULED	3
609bc05f-e920-4358-813f-93b147339a8a	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	5	2025-07-13 12:00:00	2025-07-13 13:35:00	Airbus A321	SCHEDULED	3
1d1fe752-0621-4f23-99e4-179d14d5949c	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	5	2025-07-13 15:00:00	2025-07-13 16:35:00	Airbus A321	SCHEDULED	3
48a83ceb-951c-4324-9608-7bb6f1d7ffdc	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	5	2025-07-13 18:00:00	2025-07-13 19:35:00	Airbus A321	SCHEDULED	3
22633b0a-de58-40f4-b195-19c6a5ab7ad9	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	5	2025-07-13 21:00:00	2025-07-13 22:35:00	Airbus A321	SCHEDULED	3
fb115143-e37b-4477-b85d-caa3e94f8151	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	5	2025-07-14 06:00:00	2025-07-14 07:35:00	Airbus A321	SCHEDULED	3
d0cd59fd-a0be-41e7-b139-53f405bd1259	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	5	2025-07-14 09:00:00	2025-07-14 10:35:00	Airbus A321	SCHEDULED	3
af5f8492-105c-4c15-b518-8b75d01050a4	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	5	2025-07-14 12:00:00	2025-07-14 13:35:00	Airbus A321	SCHEDULED	3
05b6a462-512b-4e75-a58a-11dc68655190	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	5	2025-07-14 15:00:00	2025-07-14 16:35:00	Airbus A321	SCHEDULED	3
21ff2b39-c100-4065-8b90-f23026648ea7	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	5	2025-07-14 18:00:00	2025-07-14 19:35:00	Airbus A321	SCHEDULED	3
4366b186-d5f7-4b3a-90f7-219833dd1763	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	5	2025-07-14 21:00:00	2025-07-14 22:35:00	Airbus A321	SCHEDULED	3
ede33bf9-5a0b-430b-9efd-0c1f40a96a19	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	6	2025-07-13 06:00:00	2025-07-13 07:35:00	Airbus A321	SCHEDULED	3
edb49d93-d668-49c0-b5c8-131e010b165f	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	6	2025-07-13 09:00:00	2025-07-13 10:35:00	Airbus A321	SCHEDULED	3
6e1b824f-a1d4-49d2-9e1d-2c97f4f1c096	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	6	2025-07-13 12:00:00	2025-07-13 13:35:00	Airbus A321	SCHEDULED	3
9a44ee96-a125-4d65-acf6-287f39e03a6e	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	6	2025-07-13 15:00:00	2025-07-13 16:35:00	Airbus A321	SCHEDULED	3
e4ef90f4-b38a-45cc-8054-1ab2782a4a39	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	6	2025-07-13 18:00:00	2025-07-13 19:35:00	Airbus A321	SCHEDULED	3
2f855b11-aa21-4dd5-90cf-3ff0bc07c164	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	6	2025-07-13 21:00:00	2025-07-13 22:35:00	Airbus A321	SCHEDULED	3
ead9bef5-0b4b-44bc-b0ff-4e68db3a3d0f	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	6	2025-07-14 06:00:00	2025-07-14 07:35:00	Airbus A321	SCHEDULED	3
9d57158c-6789-421c-8f7e-2cff1d64bbeb	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	6	2025-07-14 09:00:00	2025-07-14 10:35:00	Airbus A321	SCHEDULED	3
c136b7ec-1c2c-4dde-8b21-f27cc45913da	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	6	2025-07-14 12:00:00	2025-07-14 13:35:00	Airbus A321	SCHEDULED	3
55bc41ed-5444-45a2-932a-f7c94c96ed3b	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	6	2025-07-14 15:00:00	2025-07-14 16:35:00	Airbus A321	SCHEDULED	3
36be73ce-307e-4364-8008-d79c56c38057	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	6	2025-07-14 18:00:00	2025-07-14 19:35:00	Airbus A321	SCHEDULED	3
71578594-d8af-4649-9cb1-6d72861731d8	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	6	2025-07-14 21:00:00	2025-07-14 22:35:00	Airbus A321	SCHEDULED	3
ecc7b2e6-c2b5-4216-afe2-990d6c351f5c	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	1	2025-07-11 13:55:00	2025-07-11 16:00:00	Boeing 737	SCHEDULED	7
20a4264b-e01a-4c71-b20f-7c5e32bc4c3a	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	1	2025-07-11 19:10:00	2025-07-11 21:15:00	Boeing 737	SCHEDULED	7
2763bd08-da06-44ac-991f-d7cb53714ba9	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	1	2025-07-11 21:40:00	2025-07-11 23:45:00	Airbus A320	SCHEDULED	3
42d70ebb-60c5-4cc9-a600-dc21add03aed	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	2	2025-07-11 14:45:00	2025-07-11 16:50:00	Airbus A320	SCHEDULED	3
ce4d1ff6-de81-4b64-8987-b6c9c1bc5af9	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	2	2025-07-11 14:20:00	2025-07-11 16:25:00	Airbus A320	SCHEDULED	3
938c1617-fe18-4476-b38a-0b0d42392330	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3	2025-07-11 14:00:00	2025-07-11 15:20:00	ATR 72	SCHEDULED	15
90b80b0b-3e66-49c5-bd59-41de410dddef	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3	2025-07-11 20:50:00	2025-07-11 22:10:00	Boeing 737	SCHEDULED	7
f948a447-7432-45c2-884e-fafc93205991	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3	2025-07-11 12:10:00	2025-07-11 13:30:00	Airbus A320	SCHEDULED	3
3f68b426-02a9-4e23-8dd9-f0e6f8d2a2d4	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	4	2025-07-11 09:35:00	2025-07-11 10:55:00	Airbus A321	SCHEDULED	3
c1b1f880-f44f-4201-bcaa-648a065720ea	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	4	2025-07-11 07:15:00	2025-07-11 08:35:00	Airbus A321	SCHEDULED	3
15a4f10c-be99-4823-9b02-dfd098b5ddda	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	7	2025-07-13 06:00:00	2025-07-13 07:20:00	Airbus A321	SCHEDULED	3
54ef0794-d20c-4c2e-80d5-a4a707d94e9e	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	7	2025-07-13 09:00:00	2025-07-13 10:20:00	Airbus A321	SCHEDULED	3
dc8cbf17-85e1-4851-85be-638eb699aa50	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	7	2025-07-13 12:00:00	2025-07-13 13:20:00	Airbus A321	SCHEDULED	3
430d39d1-69ac-46b3-8de2-0666e32ce0df	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	7	2025-07-13 15:00:00	2025-07-13 16:20:00	Airbus A321	SCHEDULED	3
1656b694-d58f-4bd8-8931-e0104a38e5c0	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	7	2025-07-13 18:00:00	2025-07-13 19:20:00	Airbus A321	SCHEDULED	3
904886c1-891f-4ef6-aad9-f81a90f1f52d	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	7	2025-07-13 21:00:00	2025-07-13 22:20:00	Airbus A321	SCHEDULED	3
fc117ce1-95cc-4336-92fa-4c9c8c9bffa9	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	7	2025-07-14 06:00:00	2025-07-14 07:20:00	Airbus A321	SCHEDULED	3
e1e4faa1-bea9-4d5e-a5ba-5cb15a6704ee	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	7	2025-07-14 09:00:00	2025-07-14 10:20:00	Airbus A321	SCHEDULED	3
2359586c-a4f0-414a-ac72-27a34d77677b	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	7	2025-07-14 12:00:00	2025-07-14 13:20:00	Airbus A321	SCHEDULED	3
e5e5f736-972d-491f-9529-301b281ef465	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	7	2025-07-14 15:00:00	2025-07-14 16:20:00	Airbus A321	SCHEDULED	3
5fa4eb41-d3a8-40d2-a10e-900ee875b1e8	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	7	2025-07-14 18:00:00	2025-07-14 19:20:00	Airbus A321	SCHEDULED	3
7807ef3c-ca2b-45c4-8371-548f974259fe	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	7	2025-07-14 21:00:00	2025-07-14 22:20:00	Airbus A321	SCHEDULED	3
11d106a5-e190-4f46-8698-912f44057def	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	4	2025-07-11 07:40:00	2025-07-11 09:00:00	ATR 72	SCHEDULED	15
398a69a9-fa2d-4b02-92f2-16af227fa9a9	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	5	2025-07-11 09:50:00	2025-07-11 11:25:00	Boeing 737	SCHEDULED	7
0f42ba73-5e08-45d1-b1fc-54ce2d52eaee	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	5	2025-07-11 10:40:00	2025-07-11 12:15:00	Airbus A321	SCHEDULED	3
92a3d43d-2386-4e09-bd4d-69b06b35b1ab	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	6	2025-07-11 17:15:00	2025-07-11 18:50:00	Boeing 737	SCHEDULED	7
005a4468-f7fc-40e5-ad65-3a96a3d5aa2f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	6	2025-07-11 16:25:00	2025-07-11 18:00:00	Airbus A320	SCHEDULED	3
ed43a18d-694a-4393-9d4b-a53d2e381e8f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	7	2025-07-11 10:55:00	2025-07-11 12:15:00	Airbus A320	SCHEDULED	3
f20f9903-cc83-4d1f-b2f6-fd0036fd388d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	7	2025-07-11 16:20:00	2025-07-11 17:40:00	Boeing 737	SCHEDULED	7
02409b35-85b0-4390-b741-a5e7c083cca0	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	8	2025-07-11 16:05:00	2025-07-11 17:25:00	Boeing 787	SCHEDULED	11
c4daf735-64ed-4c92-ae43-5199b23f1937	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	8	2025-07-11 10:15:00	2025-07-11 11:35:00	Airbus A320	SCHEDULED	3
a0b9cb27-5808-49ae-9a54-1b67af343efd	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	9	2025-07-11 21:45:00	2025-07-11 23:35:00	Airbus A320	SCHEDULED	3
966c4151-61a5-4d69-8b6c-419d7fcf04de	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	9	2025-07-11 19:25:00	2025-07-11 21:15:00	Boeing 787	SCHEDULED	11
0fa90bb5-4626-40cf-8b7f-18e282591a72	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	9	2025-07-11 15:40:00	2025-07-11 17:30:00	Boeing 737	SCHEDULED	7
ece1ee84-9742-4cf1-a6b1-4535d656b391	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	10	2025-07-11 09:30:00	2025-07-11 11:20:00	Airbus A321	SCHEDULED	3
c8fd95f9-8991-4235-bb78-94c91706f15f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	10	2025-07-11 09:50:00	2025-07-11 11:40:00	Airbus A320	SCHEDULED	3
7424d1f8-f301-4382-bea7-7bac4a3261ea	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	11	2025-07-11 17:55:00	2025-07-11 20:00:00	Airbus A320	SCHEDULED	3
b7486473-79e5-4032-ab15-71174e5a3fe7	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	11	2025-07-11 20:40:00	2025-07-11 22:45:00	Boeing 737	SCHEDULED	7
2f55bee2-71a7-42bd-8ceb-6bf3f3f69c6c	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	12	2025-07-11 12:25:00	2025-07-11 14:30:00	Airbus A320	SCHEDULED	3
3992a8b5-f2e0-40f8-b1a2-ef16b5094735	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	12	2025-07-11 08:40:00	2025-07-11 10:45:00	ATR 72	SCHEDULED	15
b5ad7e03-9b1c-4819-9d79-51ec91b3354b	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	12	2025-07-11 09:30:00	2025-07-11 11:35:00	Airbus A321	SCHEDULED	3
2e8446ca-15fe-4ba3-899c-176306c87fdc	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	8	2025-07-13 06:00:00	2025-07-13 07:20:00	Airbus A321	SCHEDULED	3
8b540f7b-7113-47ad-92e6-8450330ca286	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	8	2025-07-13 09:00:00	2025-07-13 10:20:00	Airbus A321	SCHEDULED	3
5e1cb04c-cd9f-4661-b70e-cc47a1402d4c	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	8	2025-07-13 12:00:00	2025-07-13 13:20:00	Airbus A321	SCHEDULED	3
faebc935-25a9-4431-a682-9a36104fd8c1	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	8	2025-07-13 15:00:00	2025-07-13 16:20:00	Airbus A321	SCHEDULED	3
85d8fa7d-c9e2-4972-a4d9-9b61abb09c0f	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	8	2025-07-13 18:00:00	2025-07-13 19:20:00	Airbus A321	SCHEDULED	3
85eed554-acaa-4378-93bf-88d2aeafcba8	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	8	2025-07-13 21:00:00	2025-07-13 22:20:00	Airbus A321	SCHEDULED	3
1d2d9c06-8a7e-421f-87ec-a4aab87083b1	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	8	2025-07-14 06:00:00	2025-07-14 07:20:00	Airbus A321	SCHEDULED	3
7a8c9339-1e5f-4723-a704-2f8440aa8514	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	8	2025-07-14 09:00:00	2025-07-14 10:20:00	Airbus A321	SCHEDULED	3
219e6d4e-5164-40c9-aa11-c46121f2412b	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	8	2025-07-14 12:00:00	2025-07-14 13:20:00	Airbus A321	SCHEDULED	3
f3e90f15-21c7-443a-aee9-36f3f72dd136	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	8	2025-07-14 15:00:00	2025-07-14 16:20:00	Airbus A321	SCHEDULED	3
6b5b1447-fde7-4bcf-8951-b60f7e8a70d3	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	8	2025-07-14 18:00:00	2025-07-14 19:20:00	Airbus A321	SCHEDULED	3
f6f96e55-c96d-433e-a969-4d3af7deda24	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	8	2025-07-14 21:00:00	2025-07-14 22:20:00	Airbus A321	SCHEDULED	3
ab406ce9-3429-4c75-b8e7-06c86883eb87	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	12	2025-07-11 09:10:00	2025-07-11 11:15:00	Boeing 787	SCHEDULED	11
a3dc31b0-dfbb-4fb8-9716-8deb55f8e406	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	13	2025-07-11 09:35:00	2025-07-11 10:55:00	Airbus A321	SCHEDULED	3
97f11e2f-6368-4b15-810b-7631d0b9b254	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	13	2025-07-11 07:40:00	2025-07-11 09:00:00	Airbus A320	SCHEDULED	3
14eb39d7-65d4-4047-acca-737a8809cbbd	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	13	2025-07-11 21:50:00	2025-07-11 23:10:00	ATR 72	SCHEDULED	15
a0f97612-6cc6-4d5f-a22a-4c6a59e9418f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	14	2025-07-11 10:10:00	2025-07-11 11:30:00	Boeing 787	SCHEDULED	11
a55dd98b-3dee-4564-b01d-2633fe17d16b	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	14	2025-07-11 17:00:00	2025-07-11 18:20:00	Boeing 737	SCHEDULED	7
c55b26ef-d669-424a-b94a-2d2c45fcba83	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	14	2025-07-11 20:10:00	2025-07-11 21:30:00	Boeing 737	SCHEDULED	7
a8d07188-1943-4e4d-86af-b665e9c99992	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	14	2025-07-11 09:30:00	2025-07-11 10:50:00	Airbus A321	SCHEDULED	3
554d5272-e0de-459a-8635-fb7beb649c7e	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	15	2025-07-11 10:05:00	2025-07-11 11:55:00	ATR 72	SCHEDULED	15
a16ab419-04b9-4432-b091-b00f6ba52d3c	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	15	2025-07-11 12:40:00	2025-07-11 14:30:00	Airbus A320	SCHEDULED	3
63f823b1-528a-4939-aa23-425ff961b5f4	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	15	2025-07-11 19:45:00	2025-07-11 21:35:00	Airbus A321	SCHEDULED	3
3801074f-a471-4c48-b64b-0c0fbd7e3d3c	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	15	2025-07-11 11:10:00	2025-07-11 13:00:00	Boeing 737	SCHEDULED	7
10c67887-efe1-4c3a-bbfe-a07fa63498b0	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	16	2025-07-11 20:40:00	2025-07-11 22:30:00	Boeing 787	SCHEDULED	11
88a865ea-ccc5-4355-8816-9ef885b0ee5a	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	16	2025-07-11 10:50:00	2025-07-11 12:40:00	ATR 72	SCHEDULED	15
02af0e3c-a43e-499c-bdd7-6769c504f5b3	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	17	2025-07-11 14:05:00	2025-07-11 16:05:00	Boeing 787	SCHEDULED	11
955d8d47-4933-42d9-b21b-beedee8a637d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	17	2025-07-11 16:35:00	2025-07-11 18:35:00	Boeing 737	SCHEDULED	7
85ca5942-2f11-444a-a7b4-e3e68d200b82	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	17	2025-07-11 07:40:00	2025-07-11 09:40:00	Airbus A321	SCHEDULED	3
f38f4169-5f81-43eb-b447-98da3bb2646c	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	17	2025-07-11 13:20:00	2025-07-11 15:20:00	Boeing 737	SCHEDULED	7
9227d537-3957-4a92-a873-74deb28d39ab	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	9	2025-07-13 06:00:00	2025-07-13 07:50:00	Airbus A321	SCHEDULED	3
925e7003-8026-4d9e-b196-8d0b91799f3f	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	9	2025-07-13 09:00:00	2025-07-13 10:50:00	Airbus A321	SCHEDULED	3
7614deec-db6f-4116-912e-682054dc058b	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	9	2025-07-13 12:00:00	2025-07-13 13:50:00	Airbus A321	SCHEDULED	3
f8bb3ea7-3362-416b-9d7f-f4e980a73439	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	9	2025-07-13 15:00:00	2025-07-13 16:50:00	Airbus A321	SCHEDULED	3
e3bcde49-ad8d-4005-aaf4-f47474358212	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	9	2025-07-13 18:00:00	2025-07-13 19:50:00	Airbus A321	SCHEDULED	3
3579fc0d-0edd-4c67-a213-2f79230d557c	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	9	2025-07-13 21:00:00	2025-07-13 22:50:00	Airbus A321	SCHEDULED	3
c5c8eb47-a460-407d-870d-8b50f0f4a870	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	9	2025-07-14 06:00:00	2025-07-14 07:50:00	Airbus A321	SCHEDULED	3
b2a3e46a-9fa7-4343-9eee-5b0bab8f2503	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	9	2025-07-14 09:00:00	2025-07-14 10:50:00	Airbus A321	SCHEDULED	3
b7dfc89a-f583-4f1f-8f47-b01a6dcc41dd	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	9	2025-07-14 12:00:00	2025-07-14 13:50:00	Airbus A321	SCHEDULED	3
bf5697ef-82e7-4948-a7f2-8a9b9c95176b	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	9	2025-07-14 15:00:00	2025-07-14 16:50:00	Airbus A321	SCHEDULED	3
50b4aac0-5205-4eca-9371-437c18516e10	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	9	2025-07-14 18:00:00	2025-07-14 19:50:00	Airbus A321	SCHEDULED	3
7b9f1545-b813-4396-a484-1981c23dec7f	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	9	2025-07-14 21:00:00	2025-07-14 22:50:00	Airbus A321	SCHEDULED	3
4dceccad-bf0a-4e4a-9431-01dd266f8471	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	18	2025-07-11 06:05:00	2025-07-11 08:05:00	Boeing 737	SCHEDULED	7
b3e02a8b-f1d4-4844-97f1-b474de4d4982	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	18	2025-07-11 12:50:00	2025-07-11 14:50:00	Airbus A320	SCHEDULED	3
5550a83a-f517-486e-b2b0-7c178717541b	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	18	2025-07-11 21:15:00	2025-07-11 23:15:00	ATR 72	SCHEDULED	15
c6cebf3b-85a0-46bc-bc41-5dde9aef2829	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	18	2025-07-11 07:20:00	2025-07-11 09:20:00	Airbus A320	SCHEDULED	3
79118f98-97ec-48ab-aaf4-3da21d95208b	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	19	2025-07-11 12:30:00	2025-07-11 14:35:00	Boeing 787	SCHEDULED	11
73992b2f-fc0f-4c32-88c2-2e8f64478fc3	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	19	2025-07-11 16:00:00	2025-07-11 18:05:00	ATR 72	SCHEDULED	15
500b93f7-f254-4f29-b6aa-ef9d46f29717	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	20	2025-07-11 19:35:00	2025-07-11 21:40:00	Boeing 737	SCHEDULED	7
929516a7-c810-4454-8c86-809dbec00d1b	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	20	2025-07-11 11:10:00	2025-07-11 13:15:00	Airbus A321	SCHEDULED	3
fd3cd8c7-60d6-4100-9e80-862e6528edab	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	20	2025-07-11 10:15:00	2025-07-11 12:20:00	Airbus A320	SCHEDULED	3
8f2c94af-0288-403c-b8d7-b0632ea5ca49	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	20	2025-07-11 16:30:00	2025-07-11 18:35:00	Airbus A321	SCHEDULED	3
cda485ab-776f-44b5-9013-270d92220bee	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	21	2025-07-11 18:25:00	2025-07-11 20:10:00	Airbus A321	SCHEDULED	3
fb76cfac-27c0-486b-a13d-9c45a2dc8e12	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	21	2025-07-11 20:00:00	2025-07-11 21:45:00	ATR 72	SCHEDULED	15
0c62c40c-c8cf-4f8a-986c-cf8c901a1028	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	21	2025-07-11 07:45:00	2025-07-11 09:30:00	Boeing 737	SCHEDULED	7
c99b523a-47d7-4e61-b923-75ae6bc67681	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	22	2025-07-11 18:20:00	2025-07-11 20:05:00	Airbus A321	SCHEDULED	3
8c04a7a0-44da-4f25-a810-945db370538e	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	22	2025-07-11 15:25:00	2025-07-11 17:10:00	Boeing 737	SCHEDULED	7
e09f9b5b-626a-4042-a221-64771666a8c3	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	22	2025-07-11 08:15:00	2025-07-11 10:00:00	Airbus A321	SCHEDULED	3
ffa4a5e4-888f-4fef-9caa-a630385571f6	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	23	2025-07-11 14:00:00	2025-07-11 15:35:00	Airbus A321	SCHEDULED	3
5f96fc34-97d2-4384-a8e1-fdcf86a5146f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	23	2025-07-11 09:55:00	2025-07-11 11:30:00	Airbus A321	SCHEDULED	3
7bbdecd3-15ae-4459-98d2-09a8172d216d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	24	2025-07-11 15:00:00	2025-07-11 16:35:00	Boeing 787	SCHEDULED	11
49d10777-68c7-45f9-bead-f3b97b4f4a56	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	24	2025-07-11 07:00:00	2025-07-11 08:35:00	ATR 72	SCHEDULED	15
4c8ae636-6ae9-4dba-8c04-ce06ad610971	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	10	2025-07-13 06:00:00	2025-07-13 07:50:00	Airbus A321	SCHEDULED	3
866cd354-977e-4807-969b-efe3dde01a02	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	10	2025-07-13 09:00:00	2025-07-13 10:50:00	Airbus A321	SCHEDULED	3
1ed12307-dbd8-41b3-81d6-8079923d4938	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	10	2025-07-13 12:00:00	2025-07-13 13:50:00	Airbus A321	SCHEDULED	3
27ce4554-5ab1-477f-bfc2-2b58db51d8a1	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	10	2025-07-13 15:00:00	2025-07-13 16:50:00	Airbus A321	SCHEDULED	3
5925054b-ba29-4b6a-b2c6-837e734b4b96	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	10	2025-07-13 18:00:00	2025-07-13 19:50:00	Airbus A321	SCHEDULED	3
36ea92e6-b6f1-416c-af31-6ac1822449d9	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	10	2025-07-13 21:00:00	2025-07-13 22:50:00	Airbus A321	SCHEDULED	3
43f94d22-308d-4e49-8232-19ab0a2f86c5	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	10	2025-07-14 06:00:00	2025-07-14 07:50:00	Airbus A321	SCHEDULED	3
c4d2a77e-7391-443a-ba21-5335db0490b7	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	10	2025-07-14 09:00:00	2025-07-14 10:50:00	Airbus A321	SCHEDULED	3
5fd4a9d4-57cb-427e-ab29-b53ddf6b8e14	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	10	2025-07-14 12:00:00	2025-07-14 13:50:00	Airbus A321	SCHEDULED	3
2bbc1f8c-c52e-410a-9c0f-387cdee43430	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	10	2025-07-14 15:00:00	2025-07-14 16:50:00	Airbus A321	SCHEDULED	3
7b945e55-1d61-43a9-9df7-fd592fa816cc	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	10	2025-07-14 18:00:00	2025-07-14 19:50:00	Airbus A321	SCHEDULED	3
012bcbf3-29a4-4f9a-9809-5a31725cf384	2025-07-07 19:40:48.089576	system	2025-07-07 19:40:48.089576	system	f	\N	\N	10	2025-07-14 21:00:00	2025-07-14 22:50:00	Airbus A321	SCHEDULED	3
1472db3f-a792-4b41-adb6-65b4430d7aa4	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	24	2025-07-11 21:00:00	2025-07-11 22:35:00	Airbus A321	SCHEDULED	3
8e519efa-ba53-480f-880a-e0e74fdf3719	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	1	2025-07-12 19:20:00	2025-07-12 21:25:00	Airbus A321	SCHEDULED	3
b3556b8d-ec25-4b51-898a-2e8e4b27a65d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	1	2025-07-12 15:30:00	2025-07-12 17:35:00	Boeing 737	SCHEDULED	7
c6d64358-d9fb-4c43-bbf7-02ace8e47641	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	1	2025-07-12 06:30:00	2025-07-12 08:35:00	ATR 72	SCHEDULED	15
7782c705-b954-4adf-939d-141383b8b9b7	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	1	2025-07-12 13:35:00	2025-07-12 15:40:00	Boeing 787	SCHEDULED	11
1b60e5ee-bdc5-4d07-b0e7-e90b79a62cec	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	2	2025-07-12 08:35:00	2025-07-12 10:40:00	ATR 72	SCHEDULED	15
c6f06c58-1326-4014-910e-7e6df6d1ae3b	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	2	2025-07-12 18:45:00	2025-07-12 20:50:00	ATR 72	SCHEDULED	15
3e93920a-8ace-49c0-9297-d6236ecf51b3	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	2	2025-07-12 16:20:00	2025-07-12 18:25:00	Boeing 737	SCHEDULED	7
c2be45aa-9ff4-44a8-8b2e-c99101b92979	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	2	2025-07-12 20:15:00	2025-07-12 22:20:00	Airbus A321	SCHEDULED	3
7c27f899-f9f5-46ba-bda8-5c9d83a8ba21	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3	2025-07-12 08:50:00	2025-07-12 10:10:00	Airbus A321	SCHEDULED	3
3e582e7d-e5cd-4bbd-ade7-69e3c9bf7d64	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3	2025-07-12 06:55:00	2025-07-12 08:15:00	Boeing 737	SCHEDULED	7
f34e8fc1-05ea-490c-a660-308313859843	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	3	2025-07-12 16:35:00	2025-07-12 17:55:00	ATR 72	SCHEDULED	15
21e69093-f2ed-4af3-90aa-22edf3213a78	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	4	2025-07-12 17:50:00	2025-07-12 19:10:00	Airbus A320	SCHEDULED	3
61b34db3-fb39-4d5d-a998-b74d4c55ccae	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	4	2025-07-12 19:20:00	2025-07-12 20:40:00	Airbus A321	SCHEDULED	3
e3655339-1473-4de7-80be-32435a755f9b	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	4	2025-07-12 09:30:00	2025-07-12 10:50:00	ATR 72	SCHEDULED	15
878b66dc-223f-43de-a34d-f23aa35caf1a	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	4	2025-07-12 21:50:00	2025-07-12 23:10:00	Airbus A321	SCHEDULED	3
19f6a6f0-971f-454f-b79e-7edd706b2b9e	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	5	2025-07-12 14:15:00	2025-07-12 15:50:00	Boeing 737	SCHEDULED	7
7eb0d9e9-d8a7-4d03-b0ea-6558e070a989	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	5	2025-07-12 07:10:00	2025-07-12 08:45:00	Boeing 787	SCHEDULED	11
b19b82d8-a815-49d4-87c4-d47d967237b8	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	5	2025-07-12 21:40:00	2025-07-12 23:15:00	Airbus A320	SCHEDULED	3
a8e3411d-c341-4de4-85f2-20634c2c6cad	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	6	2025-07-12 06:10:00	2025-07-12 07:45:00	Boeing 737	SCHEDULED	7
735d5c36-f4d1-4b2d-a652-6335f365a593	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	6	2025-07-12 17:45:00	2025-07-12 19:20:00	Boeing 787	SCHEDULED	11
ba348e0b-7aa5-46c9-8e3e-616a42444957	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	6	2025-07-12 18:30:00	2025-07-12 20:05:00	Boeing 737	SCHEDULED	7
952b405c-39fd-4d4c-a2da-7946ed82c182	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	7	2025-07-12 09:40:00	2025-07-12 11:00:00	Boeing 787	SCHEDULED	11
4b83e5cb-dd14-42ac-9d8b-68d06969cad1	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	7	2025-07-12 19:45:00	2025-07-12 21:05:00	Boeing 737	SCHEDULED	7
3dc53ebf-2ac8-41d5-836c-fe75c2ce63f6	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	8	2025-07-12 19:20:00	2025-07-12 20:40:00	Boeing 737	SCHEDULED	7
97c994bb-d174-44e9-bc2d-587200f4f5f8	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	8	2025-07-12 18:25:00	2025-07-12 19:45:00	Airbus A320	SCHEDULED	3
fd375409-fc2d-4282-814b-13ca90677827	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	9	2025-07-12 20:45:00	2025-07-12 22:35:00	Airbus A321	SCHEDULED	3
8d05609d-ac22-493a-bdaa-f089cfd91660	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	9	2025-07-12 12:05:00	2025-07-12 13:55:00	Airbus A321	SCHEDULED	3
39628ab0-be84-4e8e-8014-3114fbf41e7e	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	9	2025-07-12 17:10:00	2025-07-12 19:00:00	Boeing 737	SCHEDULED	7
ecb48cbe-14b1-4aba-b66a-6b74ff1eeb38	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	10	2025-07-12 20:45:00	2025-07-12 22:35:00	Boeing 737	SCHEDULED	7
34d40499-60ec-4a68-95fa-966382d55652	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	10	2025-07-12 13:00:00	2025-07-12 14:50:00	ATR 72	SCHEDULED	15
3238cc7c-d2c7-4121-932f-be3b7ef810ac	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	10	2025-07-12 13:00:00	2025-07-12 14:50:00	Airbus A320	SCHEDULED	3
477cf0a6-efcb-43e5-9d12-670d6ede39e9	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	10	2025-07-12 18:20:00	2025-07-12 20:10:00	Boeing 737	SCHEDULED	7
8a47b4b6-2463-42f2-ab1b-7e33095f699e	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	11	2025-07-12 10:40:00	2025-07-12 12:45:00	ATR 72	SCHEDULED	15
7cdde664-6770-4032-aec5-1d762529dc2e	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	11	2025-07-12 14:20:00	2025-07-12 16:25:00	Boeing 787	SCHEDULED	11
ca4aed3a-50ef-4dcc-83bd-fb97b11a5846	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	12	2025-07-12 14:15:00	2025-07-12 16:20:00	Airbus A320	SCHEDULED	3
61b244af-be47-4aa5-84ce-7f97e1a7e221	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	12	2025-07-12 09:30:00	2025-07-12 11:35:00	Boeing 737	SCHEDULED	7
32332605-d190-4ced-9e94-8fb5d1d86c6c	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	13	2025-07-12 12:30:00	2025-07-12 13:50:00	Airbus A320	SCHEDULED	3
4bc4ff17-bb49-45f7-b21c-2096a72a1c06	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	13	2025-07-12 20:35:00	2025-07-12 21:55:00	Airbus A320	SCHEDULED	3
2ceeb534-4c66-400b-a6a7-c6c8633fa9ce	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	13	2025-07-12 11:45:00	2025-07-12 13:05:00	Boeing 787	SCHEDULED	11
92b33b9c-3499-48ce-8191-9de520a996e2	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	14	2025-07-12 15:20:00	2025-07-12 16:40:00	Airbus A320	SCHEDULED	3
4573a061-c122-46a9-baad-12cffa8f00ca	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	14	2025-07-12 19:25:00	2025-07-12 20:45:00	Boeing 737	SCHEDULED	7
a2721299-bc10-4cba-b3eb-616597316af0	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	14	2025-07-12 16:10:00	2025-07-12 17:30:00	Airbus A320	SCHEDULED	3
e97de657-55a4-4649-bea6-20799e942bf7	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	15	2025-07-12 13:40:00	2025-07-12 15:30:00	ATR 72	SCHEDULED	15
9c85c00b-c9e6-47e3-ac7b-20a18d9f5793	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	15	2025-07-12 20:15:00	2025-07-12 22:05:00	ATR 72	SCHEDULED	15
0cabfacb-bb19-4e7e-b30e-0da2dcd5c717	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	15	2025-07-12 20:35:00	2025-07-12 22:25:00	Boeing 787	SCHEDULED	11
93b3f200-2df3-49d0-a07a-6f8e101fa45d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	16	2025-07-12 20:15:00	2025-07-12 22:05:00	ATR 72	SCHEDULED	15
75f4a18f-c2fd-49ab-aa43-6d4fa30c9903	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	16	2025-07-12 15:55:00	2025-07-12 17:45:00	ATR 72	SCHEDULED	15
9328881a-fdf4-4561-bdc7-35c0cf0a8af2	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	16	2025-07-12 13:20:00	2025-07-12 15:10:00	Airbus A320	SCHEDULED	3
106097d9-7604-4ec7-be2d-d9871e3ba7d4	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	16	2025-07-12 10:00:00	2025-07-12 11:50:00	Boeing 787	SCHEDULED	11
72b78b7c-14e2-4455-94b2-9a7098270ef3	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	17	2025-07-12 21:40:00	2025-07-12 23:40:00	Airbus A321	SCHEDULED	3
87c4a60a-80ef-47e8-9c5d-1eb472402b8e	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	17	2025-07-12 14:30:00	2025-07-12 16:30:00	Boeing 787	SCHEDULED	11
be03470a-78e2-48df-83f1-e6297c462a16	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	17	2025-07-12 18:00:00	2025-07-12 20:00:00	Airbus A321	SCHEDULED	3
4f489842-9bbd-41de-b7c5-9c520c60d771	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	18	2025-07-12 12:15:00	2025-07-12 14:15:00	Airbus A321	SCHEDULED	3
836c9393-5730-499b-bb6b-fdd027d712b3	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	18	2025-07-12 10:15:00	2025-07-12 12:15:00	Airbus A320	SCHEDULED	3
613d0022-dafe-4fa1-9da9-d95bcb3a3491	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	19	2025-07-12 17:10:00	2025-07-12 19:15:00	ATR 72	SCHEDULED	15
145fd86d-b265-4a85-bc37-764cdb7ed987	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	19	2025-07-12 07:45:00	2025-07-12 09:50:00	Airbus A320	SCHEDULED	3
673267f3-ad18-4b03-ab01-90086a0fa266	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	19	2025-07-12 20:30:00	2025-07-12 22:35:00	Boeing 737	SCHEDULED	7
d4391439-8f37-4c8b-b581-583954185934	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	20	2025-07-12 10:30:00	2025-07-12 12:35:00	Airbus A321	SCHEDULED	3
b81571ea-4a49-4841-b2f9-32af6af49267	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	20	2025-07-12 13:25:00	2025-07-12 15:30:00	Boeing 737	SCHEDULED	7
b365ad34-3cf3-4315-83d5-f32acbf0e927	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	20	2025-07-12 07:10:00	2025-07-12 09:15:00	Boeing 737	SCHEDULED	7
23e48e6d-2fbd-444a-8774-6356efeff4be	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	20	2025-07-12 11:30:00	2025-07-12 13:35:00	Airbus A320	SCHEDULED	3
54ccbca7-5f65-4670-a900-17e5f5d4d9b8	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	21	2025-07-12 17:20:00	2025-07-12 19:05:00	ATR 72	SCHEDULED	15
044badeb-f8ca-4965-b737-aa643083cd5d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	21	2025-07-12 19:35:00	2025-07-12 21:20:00	ATR 72	SCHEDULED	15
008bd5af-8b62-41cd-9139-13cb8d700d03	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	22	2025-07-12 12:00:00	2025-07-12 13:45:00	ATR 72	SCHEDULED	15
7f3da7ed-3bb8-4448-92b3-49d689490416	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	22	2025-07-12 07:45:00	2025-07-12 09:30:00	Boeing 737	SCHEDULED	7
35e008d1-db17-474f-a84a-98c5ce1d1f6f	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	23	2025-07-12 12:30:00	2025-07-12 14:05:00	Boeing 737	SCHEDULED	7
07572566-8039-44ff-b286-b9ec6a84edb6	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	23	2025-07-12 18:00:00	2025-07-12 19:35:00	ATR 72	SCHEDULED	15
f07d27e1-6a8e-43e4-9f15-5af46a48cd5c	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	23	2025-07-12 11:55:00	2025-07-12 13:30:00	Airbus A320	SCHEDULED	3
3f7b8004-7746-4d06-8719-b23c6c346836	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	23	2025-07-12 13:10:00	2025-07-12 14:45:00	Airbus A320	SCHEDULED	3
9f4d69f8-67a6-4c5e-ba97-8914c4991cb2	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	24	2025-07-12 07:25:00	2025-07-12 09:00:00	ATR 72	SCHEDULED	15
26463d9f-1ad1-4a48-b7da-7f4d5e86305c	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	24	2025-07-12 07:55:00	2025-07-12 09:30:00	ATR 72	SCHEDULED	15
87e3a202-6f9e-4fc5-8409-66072587c6fe	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	24	2025-07-12 12:35:00	2025-07-12 14:10:00	Airbus A320	SCHEDULED	3
cc5b8d1b-d6cf-43be-9b0b-1e484d98673d	2025-07-07 20:35:15.620618	daily_generator	2025-07-07 20:35:15.620618	daily_generator	f	\N	\N	24	2025-07-12 13:15:00	2025-07-12 14:50:00	ATR 72	SCHEDULED	15
7b9c4e40-02ac-4878-a140-30866a11a7e8	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	1	2025-07-08 16:05:00	2025-07-08 18:10:00	Airbus A320	SCHEDULED	3
60933fe0-98b0-45ac-ac8f-f2466544af3a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	1	2025-07-08 06:40:00	2025-07-08 08:45:00	Airbus A320	SCHEDULED	3
b020551d-19d1-4b56-be2a-0c939f10f0cd	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	1	2025-07-08 19:30:00	2025-07-08 21:35:00	ATR 72	SCHEDULED	15
de7eaa89-ec66-4731-8a95-a0e56a41dc18	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2	2025-07-08 19:05:00	2025-07-08 21:10:00	Airbus A320	SCHEDULED	3
022bff68-458c-4279-aca0-b1493149c0ca	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2	2025-07-08 08:20:00	2025-07-08 10:25:00	Boeing 737	SCHEDULED	7
659ea18d-7edc-4f34-9ac4-f3947c91d8e3	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2	2025-07-08 17:55:00	2025-07-08 20:00:00	Boeing 787	SCHEDULED	11
751cd4bf-4b35-4368-8d15-f681543b9498	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3	2025-07-08 13:55:00	2025-07-08 15:15:00	Airbus A321	SCHEDULED	3
e96ea9ae-bf7b-4a73-b739-7522bd0de925	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3	2025-07-08 06:25:00	2025-07-08 07:45:00	Boeing 737	SCHEDULED	7
4d3ea774-40d9-453a-b142-5e0c4913458b	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4	2025-07-08 13:00:00	2025-07-08 14:20:00	Airbus A321	SCHEDULED	3
f70c5a80-836e-47b7-aef6-3b1ca7282ca4	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4	2025-07-08 14:30:00	2025-07-08 15:50:00	Airbus A320	SCHEDULED	3
65243a79-1be9-4ede-b4e8-4df91c8cbd1e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5	2025-07-08 14:50:00	2025-07-08 16:25:00	Airbus A320	SCHEDULED	3
835bab1b-7a74-44d3-906a-086a10621402	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5	2025-07-08 07:30:00	2025-07-08 09:05:00	Airbus A321	SCHEDULED	3
76ed55a0-3fa4-4e63-a890-ab6f7df38856	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5	2025-07-08 12:25:00	2025-07-08 14:00:00	ATR 72	SCHEDULED	15
e00c2a2f-f52e-464c-8c31-3dfc882884b1	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5	2025-07-08 15:25:00	2025-07-08 17:00:00	Airbus A321	SCHEDULED	3
d006af0f-e3bb-443a-ac4e-5643767fbfee	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6	2025-07-08 18:10:00	2025-07-08 19:45:00	ATR 72	SCHEDULED	15
9828fe71-a599-499b-a58a-94efa0c199e4	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6	2025-07-08 08:30:00	2025-07-08 10:05:00	Boeing 787	SCHEDULED	11
37f07bac-ca1b-4bbf-8175-25c0982c722a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6	2025-07-08 19:10:00	2025-07-08 20:45:00	ATR 72	SCHEDULED	15
36f067f8-d998-4c7a-8c1c-143b5e28c67d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6	2025-07-08 07:50:00	2025-07-08 09:25:00	Airbus A320	SCHEDULED	3
35c6e193-3773-4d15-9ee3-43f73f9eeaf1	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7	2025-07-08 14:30:00	2025-07-08 15:50:00	Boeing 787	SCHEDULED	11
688ca275-5b5d-4f6b-88b3-e70bb8d64cc2	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7	2025-07-08 14:25:00	2025-07-08 15:45:00	Boeing 787	SCHEDULED	11
0a2f2089-73d0-4a75-bb47-cf705c7c0aef	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7	2025-07-08 16:40:00	2025-07-08 18:00:00	Airbus A320	SCHEDULED	3
1c91557f-ddf1-40a4-b9dd-f32c08e8667e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7	2025-07-08 14:30:00	2025-07-08 15:50:00	Boeing 787	SCHEDULED	11
ac7dd7c0-4dad-44fb-9b3a-a0301082b1d5	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8	2025-07-08 10:20:00	2025-07-08 11:40:00	ATR 72	SCHEDULED	15
6cc18ee7-e6a8-4a90-a8ed-abd59b27e319	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8	2025-07-08 11:25:00	2025-07-08 12:45:00	Boeing 737	SCHEDULED	7
dde77500-1cd0-45ef-8ff5-a84face1f53d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8	2025-07-08 10:05:00	2025-07-08 11:25:00	Airbus A321	SCHEDULED	3
bf66064c-46ad-481f-a42f-5a147c0b880f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8	2025-07-08 13:30:00	2025-07-08 14:50:00	Boeing 737	SCHEDULED	7
3cc80e4a-b35b-4a97-837d-6af8e6f386cd	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9	2025-07-08 12:05:00	2025-07-08 13:55:00	Airbus A320	SCHEDULED	3
1cf295e4-06b3-4e97-8ad4-a7fe4d57306e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9	2025-07-08 17:20:00	2025-07-08 19:10:00	Boeing 787	SCHEDULED	11
4d388234-24b6-4f34-aaed-d01a5c70616e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9	2025-07-08 18:55:00	2025-07-08 20:45:00	ATR 72	SCHEDULED	15
a0ab9340-7b76-4725-823e-836b0df702dd	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9	2025-07-08 12:55:00	2025-07-08 14:45:00	ATR 72	SCHEDULED	15
47cafe1a-ed1b-4785-a068-8ca18e163904	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	10	2025-07-08 12:25:00	2025-07-08 14:15:00	Boeing 737	SCHEDULED	7
c85ddc42-ee13-44bc-b3bd-bd41d2ebf34a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	10	2025-07-08 18:20:00	2025-07-08 20:10:00	Boeing 787	SCHEDULED	11
e9d578b7-196f-4a53-8593-1ab2c57571ed	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	11	2025-07-08 08:50:00	2025-07-08 10:55:00	ATR 72	SCHEDULED	15
e3164799-4bb7-4528-bf60-8c4c325a72bb	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	11	2025-07-08 08:15:00	2025-07-08 10:20:00	Airbus A320	SCHEDULED	3
9f04760e-2549-479e-b166-36acb9ecbe49	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	11	2025-07-08 17:45:00	2025-07-08 19:50:00	Airbus A320	SCHEDULED	3
1584d657-2df6-40f2-8429-3e1fe43b1552	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	12	2025-07-08 09:25:00	2025-07-08 11:30:00	Boeing 737	SCHEDULED	7
7046a00a-fbd5-4af4-a078-287ad1181533	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	12	2025-07-08 08:00:00	2025-07-08 10:05:00	Boeing 737	SCHEDULED	7
2f40d736-fb05-45fa-b3e9-5144b54d92f5	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	13	2025-07-08 19:40:00	2025-07-08 21:00:00	Airbus A320	SCHEDULED	3
acce0754-ec70-48b7-9427-185de68b5e5c	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	13	2025-07-08 13:50:00	2025-07-08 15:10:00	Airbus A321	SCHEDULED	3
22af9330-178f-42e9-a40f-c51418e89b53	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	14	2025-07-08 21:35:00	2025-07-08 22:55:00	Airbus A320	SCHEDULED	3
989af986-ab16-41c4-9efb-9ef411ed79be	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	14	2025-07-08 09:35:00	2025-07-08 10:55:00	Airbus A320	SCHEDULED	3
a66c6905-720c-41d7-8ed1-f8e018b75b1f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	15	2025-07-08 19:15:00	2025-07-08 21:05:00	Airbus A321	SCHEDULED	3
9445ac5a-ee20-4dec-a66c-0edbe73f7038	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	15	2025-07-08 18:40:00	2025-07-08 20:30:00	Airbus A321	SCHEDULED	3
a7e8de7a-2d9d-4f58-ba92-f8ec9bc12541	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	15	2025-07-08 13:30:00	2025-07-08 15:20:00	Airbus A321	SCHEDULED	3
34d5bc6c-583a-44d7-8028-3bb52c9d3c22	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	15	2025-07-08 19:10:00	2025-07-08 21:00:00	Airbus A320	SCHEDULED	3
da3b24c0-91de-473d-9b75-aaf51fc81fff	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	16	2025-07-08 09:35:00	2025-07-08 11:25:00	Boeing 737	SCHEDULED	7
9f0ef1ac-2f43-49fa-bdd4-3a27bc850cf4	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	16	2025-07-08 13:55:00	2025-07-08 15:45:00	ATR 72	SCHEDULED	15
71698fed-d48f-4060-b1f1-c4c1b2568819	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	17	2025-07-08 19:25:00	2025-07-08 21:25:00	Airbus A321	SCHEDULED	3
27b136ec-fc7c-41d5-9147-d52533ac845a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	17	2025-07-08 19:55:00	2025-07-08 21:55:00	Boeing 737	SCHEDULED	7
c7b6f986-383f-4d45-92ef-298c8b4aba92	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	17	2025-07-08 07:30:00	2025-07-08 09:30:00	Airbus A320	SCHEDULED	3
bc2d71c0-da38-410b-9906-6a46574f8dea	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	17	2025-07-08 21:00:00	2025-07-08 23:00:00	Boeing 737	SCHEDULED	7
98bcbe86-abff-4f83-8ed3-32754e7a8390	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	18	2025-07-08 21:50:00	2025-07-08 23:50:00	ATR 72	SCHEDULED	15
ee8f657b-1ef0-4697-8601-7f24c5444b3d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	18	2025-07-08 07:30:00	2025-07-08 09:30:00	ATR 72	SCHEDULED	15
5a5c7659-e3de-4753-bf17-930b1ffdb339	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	18	2025-07-08 17:15:00	2025-07-08 19:15:00	Airbus A321	SCHEDULED	3
de5d4833-c4a0-459b-aad6-cbadc1714243	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	19	2025-07-08 11:45:00	2025-07-08 13:50:00	Boeing 787	SCHEDULED	11
7474d873-98c4-4679-aeb9-03b2c8c8428d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	19	2025-07-08 08:10:00	2025-07-08 10:15:00	Boeing 787	SCHEDULED	11
684e7c93-bd39-4dcd-9458-978aab0ff02e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	19	2025-07-08 09:20:00	2025-07-08 11:25:00	Airbus A320	SCHEDULED	3
526cd407-4da2-4ccd-a97c-80df4a1422ce	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	20	2025-07-08 19:25:00	2025-07-08 21:30:00	Airbus A321	SCHEDULED	3
c5540f4b-f857-4b38-8358-28615ac6c408	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	20	2025-07-08 10:35:00	2025-07-08 12:40:00	Boeing 787	SCHEDULED	11
7605a67f-5ebc-4543-b590-67d44dd5c84e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	20	2025-07-08 13:15:00	2025-07-08 15:20:00	ATR 72	SCHEDULED	15
0820c366-c599-4e17-8679-e6fcda463aa0	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	20	2025-07-08 16:25:00	2025-07-08 18:30:00	Boeing 787	SCHEDULED	11
c516fa4f-a57b-40c0-9ea2-ea48328d5bca	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	21	2025-07-08 16:20:00	2025-07-08 18:05:00	Boeing 737	SCHEDULED	7
adf0d141-3992-4b88-b5d7-e438adaf2f7d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	21	2025-07-08 11:00:00	2025-07-08 12:45:00	Boeing 737	SCHEDULED	7
53fecf88-61a5-41f1-be79-2c42ea01730c	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	22	2025-07-08 10:00:00	2025-07-08 11:45:00	ATR 72	SCHEDULED	15
95dd38cc-c458-497c-9e17-8720828476f9	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	22	2025-07-08 19:15:00	2025-07-08 21:00:00	Airbus A320	SCHEDULED	3
e39d6d92-261a-4680-a1b9-646b5ec50cd9	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	23	2025-07-08 10:40:00	2025-07-08 12:15:00	Airbus A321	SCHEDULED	3
81f33823-1a33-4266-98fa-bf3708495b3a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	23	2025-07-08 17:15:00	2025-07-08 18:50:00	Airbus A321	SCHEDULED	3
c988eb1d-0a06-43fd-92a8-728c9d0a38a6	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	24	2025-07-08 07:45:00	2025-07-08 09:20:00	Airbus A321	SCHEDULED	3
54e87d9f-1235-4e53-ab14-af8b240968cc	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	24	2025-07-08 11:20:00	2025-07-08 12:55:00	Airbus A321	SCHEDULED	3
687c613a-615f-4745-906b-eacf45c6a023	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	24	2025-07-08 13:10:00	2025-07-08 14:45:00	Boeing 787	SCHEDULED	11
b7af2560-5c58-4a44-9e08-082f38d4a440	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	24	2025-07-08 13:25:00	2025-07-08 15:00:00	Boeing 737	SCHEDULED	7
4cd140fa-a7fe-499a-89c4-5a2136660089	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	1	2025-07-09 15:15:00	2025-07-09 17:20:00	Boeing 787	SCHEDULED	11
f2824215-c005-4c49-bc25-969e6ec054c7	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	1	2025-07-09 17:10:00	2025-07-09 19:15:00	ATR 72	SCHEDULED	15
42812cd8-3ce3-4924-9e81-a97688f6c4f7	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	1	2025-07-09 15:25:00	2025-07-09 17:30:00	Airbus A320	SCHEDULED	3
2d61d21a-aa7d-460b-b719-7f0398a40506	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	1	2025-07-09 06:45:00	2025-07-09 08:50:00	Airbus A321	SCHEDULED	3
e59835d6-28af-4755-8878-a82b39ccdb18	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2	2025-07-09 13:55:00	2025-07-09 16:00:00	Boeing 787	SCHEDULED	11
c645eb14-0c29-491a-9de2-287113a97526	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2	2025-07-09 16:50:00	2025-07-09 18:55:00	Airbus A321	SCHEDULED	3
0a69070b-dd57-47dc-8f70-07bb773e07d6	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3	2025-07-09 15:25:00	2025-07-09 16:45:00	Boeing 737	SCHEDULED	7
944ea5fc-4c14-4d79-b0d8-5c38a5fa393f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3	2025-07-09 07:20:00	2025-07-09 08:40:00	Boeing 787	SCHEDULED	11
327a4bd6-6724-4a44-9816-c304783ba807	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3	2025-07-09 13:30:00	2025-07-09 14:50:00	Airbus A320	SCHEDULED	3
8b6400ec-9557-4075-8258-09b8c55bfd37	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3	2025-07-09 12:15:00	2025-07-09 13:35:00	ATR 72	SCHEDULED	15
e7ce4299-84e1-4c7e-b2dd-ee178a9387a7	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4	2025-07-09 17:30:00	2025-07-09 18:50:00	Airbus A321	SCHEDULED	3
e9068b10-1a08-47ae-bacb-6eeafb31f7fc	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4	2025-07-09 12:25:00	2025-07-09 13:45:00	ATR 72	SCHEDULED	15
0f904a3c-e3b5-443a-b619-37d85b5ed176	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4	2025-07-09 14:15:00	2025-07-09 15:35:00	Airbus A320	SCHEDULED	3
bef7a1ec-7973-4642-8663-3cb416a5edb9	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4	2025-07-09 11:50:00	2025-07-09 13:10:00	ATR 72	SCHEDULED	15
265e0995-5231-4cea-8f9c-cf9a47474513	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5	2025-07-09 17:00:00	2025-07-09 18:35:00	ATR 72	SCHEDULED	15
060adb81-d70f-4cb2-a372-33d5f46b013f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5	2025-07-09 08:45:00	2025-07-09 10:20:00	Airbus A321	SCHEDULED	3
a670c966-288f-4f31-aa93-de401207a66e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5	2025-07-09 15:30:00	2025-07-09 17:05:00	ATR 72	SCHEDULED	15
2834ed68-bd49-4fc7-90fb-2a32121ed445	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5	2025-07-09 13:10:00	2025-07-09 14:45:00	Boeing 787	SCHEDULED	11
14dd4209-27a1-46d9-baf2-0f4b0b3a91b0	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6	2025-07-09 21:35:00	2025-07-09 23:10:00	Airbus A320	SCHEDULED	3
8129852c-ccae-4056-9aad-e223796af533	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6	2025-07-09 06:00:00	2025-07-09 07:35:00	ATR 72	SCHEDULED	15
330dd0fb-194d-491f-aec3-0b2c31013641	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6	2025-07-09 07:20:00	2025-07-09 08:55:00	Airbus A321	SCHEDULED	3
671c9780-fd71-49fc-8680-98869ee09ecb	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6	2025-07-09 17:45:00	2025-07-09 19:20:00	Boeing 737	SCHEDULED	7
7a134f47-ad20-4e6b-82e3-3ffef1762ccd	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7	2025-07-09 10:50:00	2025-07-09 12:10:00	ATR 72	SCHEDULED	15
3a1df529-da06-419b-a53a-000eb9dd398a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7	2025-07-09 09:40:00	2025-07-09 11:00:00	Airbus A320	SCHEDULED	3
22097611-7360-4669-a310-3a286fafffc4	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8	2025-07-09 16:40:00	2025-07-09 18:00:00	Boeing 737	SCHEDULED	7
62ffafd7-3e9d-4932-8e85-80acfa554a81	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8	2025-07-09 20:40:00	2025-07-09 22:00:00	Airbus A320	SCHEDULED	3
61551d9d-6b06-405a-85e8-61df72d4c798	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9	2025-07-09 21:45:00	2025-07-09 23:35:00	Airbus A321	SCHEDULED	3
730aac5f-fe1d-4bfc-9d7d-44444b851917	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9	2025-07-09 18:45:00	2025-07-09 20:35:00	Airbus A321	SCHEDULED	3
ae0dc300-3bd4-4df7-86fc-9ec79f5734d9	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9	2025-07-09 11:45:00	2025-07-09 13:35:00	Airbus A320	SCHEDULED	3
038bfaae-1112-4ee4-aa69-2332b629c15f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9	2025-07-09 11:00:00	2025-07-09 12:50:00	Airbus A321	SCHEDULED	3
441f4f80-bef4-4640-a844-65d3781792d3	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	10	2025-07-09 13:45:00	2025-07-09 15:35:00	Boeing 737	SCHEDULED	7
6a4b9288-75bb-4a8c-9110-5b26209cac9a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	10	2025-07-09 12:35:00	2025-07-09 14:25:00	Airbus A321	SCHEDULED	3
5ebee3af-99f0-48cc-8272-d2242ac87b92	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	10	2025-07-09 13:55:00	2025-07-09 15:45:00	Airbus A320	SCHEDULED	3
6fb8e984-7152-42b4-b5db-7465c716eff3	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	11	2025-07-09 06:15:00	2025-07-09 08:20:00	Boeing 737	SCHEDULED	7
c0790599-7efb-456d-89e2-928efbd6cdde	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	11	2025-07-09 08:15:00	2025-07-09 10:20:00	Airbus A320	SCHEDULED	3
13ccd2e2-4652-49d3-9957-b9dd713cf721	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	12	2025-07-09 13:05:00	2025-07-09 15:10:00	Boeing 737	SCHEDULED	7
dcedb24b-b85c-41f6-a67e-e7d04c5bbde4	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	12	2025-07-09 10:05:00	2025-07-09 12:10:00	Airbus A321	SCHEDULED	3
4754817c-b31a-405e-8700-8bc7df899357	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	13	2025-07-09 11:45:00	2025-07-09 13:05:00	Boeing 787	SCHEDULED	11
35745e9e-4805-4517-91ff-93de3f924f69	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	13	2025-07-09 18:00:00	2025-07-09 19:20:00	Airbus A321	SCHEDULED	3
773eb36e-7506-4b94-bf8b-760091efa7d5	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	13	2025-07-09 07:40:00	2025-07-09 09:00:00	ATR 72	SCHEDULED	15
e274dc7b-88ce-4a91-b3b4-831b962c0f4d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	13	2025-07-09 09:15:00	2025-07-09 10:35:00	ATR 72	SCHEDULED	15
cbdd2022-efe5-4e96-84b8-553fc3faae70	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	14	2025-07-09 19:50:00	2025-07-09 21:10:00	Boeing 787	SCHEDULED	11
ebdae6b6-2f2a-473a-80f7-da55f233a9fa	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	14	2025-07-09 17:05:00	2025-07-09 18:25:00	Airbus A320	SCHEDULED	3
3543bf68-a069-4512-9922-053f9359cc0f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	15	2025-07-09 06:35:00	2025-07-09 08:25:00	Airbus A320	SCHEDULED	3
1206128d-8909-404b-afd7-2bc3385a5a9a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	15	2025-07-09 08:25:00	2025-07-09 10:15:00	Airbus A320	SCHEDULED	3
4449b58b-d4dd-4dfe-b208-27adfdd9e480	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	15	2025-07-09 19:45:00	2025-07-09 21:35:00	Boeing 787	SCHEDULED	11
32eb200a-fb20-4d3a-aa6d-01d1a92c7ed1	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	15	2025-07-09 07:20:00	2025-07-09 09:10:00	ATR 72	SCHEDULED	15
c899f8b9-076b-4574-a94f-02880a0c8d44	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	16	2025-07-09 06:15:00	2025-07-09 08:05:00	Boeing 737	SCHEDULED	7
dfb38f32-91b2-43d7-a0f0-eb8053d26bb8	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	16	2025-07-09 16:35:00	2025-07-09 18:25:00	Airbus A320	SCHEDULED	3
97dab713-6a32-449c-8962-58f54879b8bb	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	17	2025-07-09 07:10:00	2025-07-09 09:10:00	Boeing 787	SCHEDULED	11
353a5232-faa9-4d23-a56a-6e8961b4a77e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	17	2025-07-09 18:35:00	2025-07-09 20:35:00	Airbus A321	SCHEDULED	3
230edec8-08dd-4542-978f-446bce5d3480	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	17	2025-07-09 17:50:00	2025-07-09 19:50:00	Airbus A320	SCHEDULED	3
b3920b11-8b3f-4525-8c56-5b488932def0	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	17	2025-07-09 19:40:00	2025-07-09 21:40:00	Boeing 737	SCHEDULED	7
0720d50a-ea75-40d7-820e-0bbb2870b1c9	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	18	2025-07-09 08:50:00	2025-07-09 10:50:00	Airbus A321	SCHEDULED	3
afe6ba4a-c46d-4dd4-aa39-84d9c6850f69	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	18	2025-07-09 18:05:00	2025-07-09 20:05:00	Airbus A320	SCHEDULED	3
8e82d28d-eac3-4297-aedd-ec106eb50e36	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	18	2025-07-09 13:15:00	2025-07-09 15:15:00	Boeing 737	SCHEDULED	7
de132a44-4cad-4f74-9790-0bdc66b49c21	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	19	2025-07-09 09:10:00	2025-07-09 11:15:00	Airbus A321	SCHEDULED	3
45227fff-bab8-4473-8a15-d834bd8a6728	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	19	2025-07-09 18:25:00	2025-07-09 20:30:00	Airbus A321	SCHEDULED	3
4eb86899-800a-42a1-b4b7-b58ffc4c3cc3	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	20	2025-07-09 15:50:00	2025-07-09 17:55:00	Boeing 787	SCHEDULED	11
c7a42d42-135d-42d3-9197-305486cdb59f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	20	2025-07-09 15:25:00	2025-07-09 17:30:00	Airbus A321	SCHEDULED	3
5d6133e9-a2c8-4266-a626-c4afcea8ecdd	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	20	2025-07-09 18:50:00	2025-07-09 20:55:00	Airbus A320	SCHEDULED	3
78a5ef06-9ddd-4fdb-b599-168c79d59d51	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	20	2025-07-09 16:55:00	2025-07-09 19:00:00	Boeing 737	SCHEDULED	7
35796b49-4844-4274-9084-3ab2d3862ae2	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	21	2025-07-09 19:30:00	2025-07-09 21:15:00	Airbus A320	SCHEDULED	3
e3b34a0b-cdff-4a70-a8be-2f80251312d3	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	21	2025-07-09 11:05:00	2025-07-09 12:50:00	ATR 72	SCHEDULED	15
d89123f1-a711-4d78-bf54-70aa45397f7a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	21	2025-07-09 09:10:00	2025-07-09 10:55:00	Airbus A320	SCHEDULED	3
ca909eda-d6e2-46eb-b084-bb4f7ac07416	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	21	2025-07-09 15:50:00	2025-07-09 17:35:00	ATR 72	SCHEDULED	15
d205cf35-b822-4121-8628-0dd44db3cb04	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	22	2025-07-09 06:20:00	2025-07-09 08:05:00	Boeing 737	SCHEDULED	7
a3015bdf-1863-4705-8a25-12ff8485c9a8	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	22	2025-07-09 17:55:00	2025-07-09 19:40:00	Airbus A321	SCHEDULED	3
42785bd3-3c56-4c67-b35f-398a540f3bb4	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	22	2025-07-09 17:55:00	2025-07-09 19:40:00	Boeing 737	SCHEDULED	7
1240bc63-cdfa-42d7-9895-f26fc424f8c5	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	22	2025-07-09 16:15:00	2025-07-09 18:00:00	ATR 72	SCHEDULED	15
bd7b0df6-ec0a-4e86-af7b-29e48b6ca8eb	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	23	2025-07-09 08:10:00	2025-07-09 09:45:00	Boeing 787	SCHEDULED	11
6f14a09a-e8db-4e1a-b5ed-cf01b40f4780	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	23	2025-07-09 15:40:00	2025-07-09 17:15:00	Boeing 787	SCHEDULED	11
08a3ed3a-26df-40a5-a1f2-299e099104f7	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	23	2025-07-09 12:40:00	2025-07-09 14:15:00	ATR 72	SCHEDULED	15
6b13b8cf-a2c9-4d87-bf1d-bef5d9affd0f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	23	2025-07-09 07:40:00	2025-07-09 09:15:00	Airbus A321	SCHEDULED	3
89dc06e3-9448-4742-a525-89558f4b0c33	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	24	2025-07-09 08:35:00	2025-07-09 10:10:00	Airbus A321	SCHEDULED	3
fc693ee5-cbe1-41f9-84dc-133bfddcf8cd	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	24	2025-07-09 10:45:00	2025-07-09 12:20:00	ATR 72	SCHEDULED	15
226390e6-17dd-47ed-9b76-8471a797a22b	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	24	2025-07-09 17:15:00	2025-07-09 18:50:00	Boeing 787	SCHEDULED	11
664cd326-c67c-4949-b3c6-8c10eb56105f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	1	2025-07-10 13:25:00	2025-07-10 15:30:00	Airbus A321	SCHEDULED	3
448c2bc4-24bc-44d4-bcdc-79478e480247	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	1	2025-07-10 16:50:00	2025-07-10 18:55:00	ATR 72	SCHEDULED	15
57adc25e-b219-4579-9cb4-efcb245d9f90	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2	2025-07-10 19:25:00	2025-07-10 21:30:00	ATR 72	SCHEDULED	15
e9d4454e-2527-4bd8-93cc-1177b7ac6636	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2	2025-07-10 10:50:00	2025-07-10 12:55:00	Airbus A321	SCHEDULED	3
dfb5a137-e922-4825-8904-5d86d1e147c9	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2	2025-07-10 19:05:00	2025-07-10 21:10:00	Airbus A321	SCHEDULED	3
bb1e3926-297c-4f0a-9e74-5583037c1633	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	2	2025-07-10 12:30:00	2025-07-10 14:35:00	Boeing 737	SCHEDULED	7
2c688b89-f145-4a24-be84-abb302652b10	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3	2025-07-10 12:05:00	2025-07-10 13:25:00	Boeing 737	SCHEDULED	7
cc9ad8e9-87b5-48e9-b43b-cf2597a77aa0	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	3	2025-07-10 18:05:00	2025-07-10 19:25:00	Airbus A320	SCHEDULED	3
efaa48ef-00c2-4469-8765-9f670a8d521e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4	2025-07-10 14:05:00	2025-07-10 15:25:00	ATR 72	SCHEDULED	15
2712185e-a7ec-4910-9df3-31fc29811d02	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4	2025-07-10 06:40:00	2025-07-10 08:00:00	Boeing 737	SCHEDULED	7
3abc57cb-1558-4555-af99-46f2a2e99498	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4	2025-07-10 06:00:00	2025-07-10 07:20:00	ATR 72	SCHEDULED	15
4c505854-982d-4dc7-aeef-858fd4d7b6e1	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	4	2025-07-10 15:40:00	2025-07-10 17:00:00	Airbus A320	SCHEDULED	3
8d715126-84de-47cd-981c-bbf1fe770e1b	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5	2025-07-10 17:30:00	2025-07-10 19:05:00	Airbus A320	SCHEDULED	3
e93a029e-261a-4a8d-9092-046dedfa41b8	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5	2025-07-10 18:10:00	2025-07-10 19:45:00	Airbus A321	SCHEDULED	3
e36db64e-144b-4947-8767-2a9eb3bc1a4b	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	5	2025-07-10 12:55:00	2025-07-10 14:30:00	Boeing 787	SCHEDULED	11
3bde3874-71b2-49af-adb4-a807ebd8562b	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6	2025-07-10 08:20:00	2025-07-10 09:55:00	Airbus A320	SCHEDULED	3
feed2efd-08dd-458f-b628-1d46aa8aab40	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6	2025-07-10 18:55:00	2025-07-10 20:30:00	ATR 72	SCHEDULED	15
2d6651a2-1c13-4d35-bfbf-9435dc34fb2f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6	2025-07-10 21:25:00	2025-07-10 23:00:00	Boeing 737	SCHEDULED	7
49c862d2-1f7c-49d6-b5bd-687839564acf	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	6	2025-07-10 17:00:00	2025-07-10 18:35:00	Airbus A320	SCHEDULED	3
c3896e91-ce06-4e32-a6c5-e80190693d21	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7	2025-07-10 13:00:00	2025-07-10 14:20:00	Airbus A320	SCHEDULED	3
82b0cf8e-3e21-478a-bede-796ab1b8bdc8	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	7	2025-07-10 18:25:00	2025-07-10 19:45:00	Airbus A320	SCHEDULED	3
6198ffc0-1f55-409d-8968-3508403d2dc8	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8	2025-07-10 13:40:00	2025-07-10 15:00:00	Boeing 737	SCHEDULED	7
b833bba3-11ea-4f30-ad1f-9b609ce84b0a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8	2025-07-10 14:45:00	2025-07-10 16:05:00	Airbus A320	SCHEDULED	3
f5b3ac92-c31e-4551-9c7f-01b6b079f640	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8	2025-07-10 08:15:00	2025-07-10 09:35:00	Airbus A320	SCHEDULED	3
2e29af00-b151-42a3-82f2-cc19b2d01300	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	8	2025-07-10 09:35:00	2025-07-10 10:55:00	ATR 72	SCHEDULED	15
82c4cffc-d722-48d8-bba2-bcbd319244c6	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9	2025-07-10 10:10:00	2025-07-10 12:00:00	Airbus A321	SCHEDULED	3
87d069cd-c8b0-4a1c-9dd3-0fd8a55a75ee	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9	2025-07-10 19:05:00	2025-07-10 20:55:00	Boeing 737	SCHEDULED	7
c618224d-4176-4738-86ce-3bd34d453d8e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9	2025-07-10 17:25:00	2025-07-10 19:15:00	Airbus A320	SCHEDULED	3
ecf15915-d023-4df8-ac2a-75b84b11eb07	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	9	2025-07-10 19:35:00	2025-07-10 21:25:00	Airbus A321	SCHEDULED	3
5ef047f2-248c-4056-8f3a-387fa42291fe	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	10	2025-07-10 17:05:00	2025-07-10 18:55:00	Airbus A321	SCHEDULED	3
fecba931-3570-4571-a0e0-d35561d04ca6	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	10	2025-07-10 10:25:00	2025-07-10 12:15:00	Airbus A320	SCHEDULED	3
b8fe90b2-91ee-4c8d-83c6-8c7f2cb9d4e0	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	10	2025-07-10 21:55:00	2025-07-10 23:45:00	Airbus A321	SCHEDULED	3
07512726-4707-44ea-81f7-cde2ac67dcec	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	11	2025-07-10 10:25:00	2025-07-10 12:30:00	Airbus A320	SCHEDULED	3
5a1505bf-f79c-4b84-a1cd-fd505f80bfc4	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	11	2025-07-10 16:30:00	2025-07-10 18:35:00	Boeing 737	SCHEDULED	7
35d8991d-9caa-4d53-b9b8-ab48ba4ed808	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	11	2025-07-10 07:25:00	2025-07-10 09:30:00	Boeing 787	SCHEDULED	11
0aea8232-7bc6-4a91-b6d4-c4cf5510432f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	12	2025-07-10 12:45:00	2025-07-10 14:50:00	Airbus A321	SCHEDULED	3
8a0bf920-ccf3-4c7f-89b5-b3392c147e4a	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	12	2025-07-10 12:25:00	2025-07-10 14:30:00	Airbus A321	SCHEDULED	3
5524a3be-cc03-4417-b813-300b69348173	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	12	2025-07-10 15:35:00	2025-07-10 17:40:00	Airbus A321	SCHEDULED	3
67a728da-d100-4ebd-8bfb-f07856b6798e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	13	2025-07-10 08:50:00	2025-07-10 10:10:00	Boeing 787	SCHEDULED	11
d2c510fd-04a7-45f3-b6dc-e819f235bc80	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	13	2025-07-10 14:05:00	2025-07-10 15:25:00	ATR 72	SCHEDULED	15
2d06e37b-c1ff-4ad1-ace0-075dca6ec67b	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	13	2025-07-10 07:20:00	2025-07-10 08:40:00	Boeing 787	SCHEDULED	11
88375f85-70dd-4c55-a7e2-4db61228cbff	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	14	2025-07-10 12:20:00	2025-07-10 13:40:00	Boeing 737	SCHEDULED	7
4abcd249-eec3-4b59-96de-93417868af6b	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	14	2025-07-10 15:10:00	2025-07-10 16:30:00	Airbus A321	SCHEDULED	3
0161bb89-51ac-4a98-aebf-240aa778d96e	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	14	2025-07-10 14:15:00	2025-07-10 15:35:00	Airbus A321	SCHEDULED	3
fc3de250-137e-4318-9cba-557dfefb9ba6	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	14	2025-07-10 20:40:00	2025-07-10 22:00:00	Airbus A320	SCHEDULED	3
e5834fea-e60f-41fa-b3db-274308b14266	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	15	2025-07-10 11:50:00	2025-07-10 13:40:00	ATR 72	SCHEDULED	15
da8d656d-1939-4075-aa54-371b772439d2	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	15	2025-07-10 15:40:00	2025-07-10 17:30:00	Airbus A321	SCHEDULED	3
06ca1c92-76ce-48af-b0f0-2eebb5c97f61	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	16	2025-07-10 14:30:00	2025-07-10 16:20:00	Airbus A321	SCHEDULED	3
500588f3-2e44-43ab-95d0-31526241f1c5	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	16	2025-07-10 17:10:00	2025-07-10 19:00:00	Boeing 787	SCHEDULED	11
3470daab-f56a-44b1-9289-69795893ed86	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	16	2025-07-10 07:20:00	2025-07-10 09:10:00	Airbus A321	SCHEDULED	3
ea297952-1bad-43af-b201-2938413f3330	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	16	2025-07-10 18:20:00	2025-07-10 20:10:00	Boeing 737	SCHEDULED	7
7784fa37-c95a-46fd-881b-bdecf7167055	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	17	2025-07-10 06:25:00	2025-07-10 08:25:00	Boeing 737	SCHEDULED	7
14af8ad4-e422-46ae-8eff-fcfd14ff76d0	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	17	2025-07-10 18:50:00	2025-07-10 20:50:00	ATR 72	SCHEDULED	15
551d0bf0-3d49-4255-b473-a2e47190b91c	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	17	2025-07-10 06:40:00	2025-07-10 08:40:00	Boeing 787	SCHEDULED	11
d90b9025-914a-43d8-8bf9-3960bb0e7743	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	17	2025-07-10 07:10:00	2025-07-10 09:10:00	Boeing 737	SCHEDULED	7
afb74a60-1fed-44c4-b52d-078bf07f0be7	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	18	2025-07-10 21:20:00	2025-07-10 23:20:00	Boeing 787	SCHEDULED	11
8cc0b7b4-fd85-4085-9a20-6e9dd24c9995	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	18	2025-07-10 19:25:00	2025-07-10 21:25:00	Boeing 787	SCHEDULED	11
b5f7c560-cb9a-46c5-bea1-196b2aecd0a2	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	18	2025-07-10 06:05:00	2025-07-10 08:05:00	Boeing 737	SCHEDULED	7
f8808566-7bc1-4351-9bad-109ee4e6f869	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	18	2025-07-10 19:10:00	2025-07-10 21:10:00	ATR 72	SCHEDULED	15
940efa7b-ad8d-4f29-a371-21cc359f96c7	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	19	2025-07-10 21:05:00	2025-07-10 23:10:00	Boeing 737	SCHEDULED	7
7191adcd-34d5-49c6-87ff-111e31727947	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	19	2025-07-10 20:20:00	2025-07-10 22:25:00	Airbus A320	SCHEDULED	3
8ea7efb4-1296-40b4-bb62-ac3255580c57	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	19	2025-07-10 17:30:00	2025-07-10 19:35:00	ATR 72	SCHEDULED	15
c0d3d813-c563-4c78-9371-b8cd6d84972b	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	19	2025-07-10 13:30:00	2025-07-10 15:35:00	ATR 72	SCHEDULED	15
117d83ca-030d-4d51-b5b6-938a113385bb	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	20	2025-07-10 16:20:00	2025-07-10 18:25:00	Boeing 787	SCHEDULED	11
864b725d-43ff-4dd4-92da-5bdf219a274f	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	20	2025-07-10 16:00:00	2025-07-10 18:05:00	Boeing 787	SCHEDULED	11
a7735a14-25a3-4792-8e42-65374524b896	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	20	2025-07-10 07:25:00	2025-07-10 09:30:00	Airbus A320	SCHEDULED	3
a1674d48-bd1b-489e-8141-cfd480e837e6	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	20	2025-07-10 21:30:00	2025-07-10 23:35:00	Airbus A320	SCHEDULED	3
bcb73380-db6a-4000-a45f-84c76c804c5c	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	21	2025-07-10 12:00:00	2025-07-10 13:45:00	Airbus A321	SCHEDULED	3
c0253d8c-8dc1-434e-9a48-d3707d8e5bb2	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	21	2025-07-10 16:35:00	2025-07-10 18:20:00	ATR 72	SCHEDULED	15
3467d4c8-ea50-4193-8614-cf58c24028e3	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	21	2025-07-10 19:30:00	2025-07-10 21:15:00	ATR 72	SCHEDULED	15
00268a2d-a84e-4686-864a-513d3c7669d5	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	21	2025-07-10 17:55:00	2025-07-10 19:40:00	Boeing 787	SCHEDULED	11
c0d38813-0c94-4a26-9f68-ca73fb99dc05	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	22	2025-07-10 06:15:00	2025-07-10 08:00:00	ATR 72	SCHEDULED	15
b9ed12d0-3a2f-43fd-8152-f4c9d2c215c8	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	22	2025-07-10 21:25:00	2025-07-10 23:10:00	Airbus A320	SCHEDULED	3
eb241904-9028-4814-9c0c-4af7ab19607d	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	22	2025-07-10 18:35:00	2025-07-10 20:20:00	Airbus A321	SCHEDULED	3
b96fbc94-8b78-497e-9241-cde4b50d4ff1	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	23	2025-07-10 20:30:00	2025-07-10 22:05:00	ATR 72	SCHEDULED	15
e4e3c1c2-201e-4712-a4fb-35dd8011db05	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	23	2025-07-10 11:45:00	2025-07-10 13:20:00	Airbus A321	SCHEDULED	3
9ec917af-1aba-488f-a8dc-37834c5f8f91	2025-07-07 20:35:24.029887	daily_generator	2025-07-07 20:35:24.029887	daily_generator	f	\N	\N	24	2025-07-10 17:50:00	2025-07-10 19:25:00	Airbus A320	SCHEDULED	3
\.


--
-- TOC entry 3478 (class 0 OID 57930)
-- Dependencies: 225
-- Data for Name: flights; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flights (flight_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by, flight_number, airline_id, departure_airport_id, arrival_airport_id, base_duration_minutes, aircraft_type, base_price, is_active, status, aircraft_id) FROM stdin;
4	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	VN221	1	6	10	80	Airbus A350	100.00	t	SCHEDULED	5
5	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	VN230	1	11	6	95	Airbus A380	100.00	t	SCHEDULED	6
1	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	VN210	1	10	11	125	Airbus A220	100.00	t	SCHEDULED	2
6	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	VN231	1	6	11	95	Airbus A220	100.00	t	SCHEDULED	2
22	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	QH211	3	12	10	105	Airbus A320	100.00	t	SCHEDULED	3
23	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	QH220	3	11	20	95	Airbus A320	100.00	t	SCHEDULED	3
24	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	QH221	3	20	11	95	Airbus A320	100.00	t	SCHEDULED	3
21	2025-07-07 19:40:36.923184	system	2025-09-12 07:17:07.800771	system	f	\N	\N	QH210	3	10	12	105	Airbus A320	100.00	t	DELAYED	3
2	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	VN211	1	11	10	125	Airbus A320	100.00	t	SCHEDULED	3
7	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	VN240	1	11	12	80	Airbus A320	100.00	t	SCHEDULED	3
3	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	VN220	1	10	6	80	Airbus A330	100.00	t	SCHEDULED	4
8	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	VN241	1	12	11	80	Airbus A330	100.00	t	SCHEDULED	4
11	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	VJ150	2	10	11	125	Airbus A220	100.00	t	SCHEDULED	2
16	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	VJ171	2	14	11	110	Airbus A220	100.00	t	SCHEDULED	2
12	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	VJ151	2	11	10	125	Airbus A320	100.00	t	SCHEDULED	3
17	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	VJ180	2	11	15	120	Airbus A320	100.00	t	SCHEDULED	3
13	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	VJ160	2	10	6	80	Airbus A330	100.00	t	SCHEDULED	4
18	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	VJ181	2	15	11	120	Airbus A330	100.00	t	SCHEDULED	4
9	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	VN250	1	10	14	110	Airbus A350	100.00	t	SCHEDULED	5
14	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	VJ161	2	6	10	80	Airbus A350	100.00	t	SCHEDULED	5
19	2025-07-07 19:40:36.923184	system	2025-09-12 07:46:13.362504	system	f	\N	\N	QH200	3	10	11	125	Airbus A350	1232132.00	t	DELAYED	5
10	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	VN251	1	14	10	110	Airbus A380	100.00	t	SCHEDULED	6
15	2025-07-07 19:40:36.923184	system	2025-07-07 19:40:36.923184	system	f	\N	\N	VJ170	2	11	14	110	Airbus A380	100.00	t	SCHEDULED	6
20	2025-07-07 19:40:36.923184	system	2025-09-12 07:16:56.001573	system	f	\N	\N	QH201	3	11	10	125	Airbus A380	100.00	t	ACTIVE	6
\.


--
-- TOC entry 3488 (class 0 OID 0)
-- Dependencies: 228
-- Name: aircraft_aircraft_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aircraft_aircraft_id_seq', 15, true);


--
-- TOC entry 3489 (class 0 OID 0)
-- Dependencies: 218
-- Name: airlines_airline_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.airlines_airline_id_seq', 4, true);


--
-- TOC entry 3490 (class 0 OID 0)
-- Dependencies: 220
-- Name: airports_airport_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.airports_airport_id_seq', 22, true);


--
-- TOC entry 3491 (class 0 OID 0)
-- Dependencies: 226
-- Name: flights_flight_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.flights_flight_id_seq', 24, true);


--
-- TOC entry 3301 (class 2606 OID 57937)
-- Name: databasechangeloglock databasechangeloglock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.databasechangeloglock
    ADD CONSTRAINT databasechangeloglock_pkey PRIMARY KEY (id);


--
-- TOC entry 3314 (class 2606 OID 58240)
-- Name: aircraft pk_aircraft; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aircraft
    ADD CONSTRAINT pk_aircraft PRIMARY KEY (aircraft_id);


--
-- TOC entry 3293 (class 2606 OID 57939)
-- Name: airlines pk_airlines; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.airlines
    ADD CONSTRAINT pk_airlines PRIMARY KEY (airline_id);


--
-- TOC entry 3297 (class 2606 OID 57941)
-- Name: airports pk_airports; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.airports
    ADD CONSTRAINT pk_airports PRIMARY KEY (airport_id);


--
-- TOC entry 3303 (class 2606 OID 57943)
-- Name: flight_fares pk_flight_fares; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flight_fares
    ADD CONSTRAINT pk_flight_fares PRIMARY KEY (fare_id);


--
-- TOC entry 3312 (class 2606 OID 58013)
-- Name: flight_outbox_events pk_flight_outbox_events; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flight_outbox_events
    ADD CONSTRAINT pk_flight_outbox_events PRIMARY KEY (id);


--
-- TOC entry 3305 (class 2606 OID 57949)
-- Name: flight_schedules pk_flight_schedules; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flight_schedules
    ADD CONSTRAINT pk_flight_schedules PRIMARY KEY (schedule_id);


--
-- TOC entry 3307 (class 2606 OID 57951)
-- Name: flights pk_flights; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flights
    ADD CONSTRAINT pk_flights PRIMARY KEY (flight_id);


--
-- TOC entry 3316 (class 2606 OID 58242)
-- Name: aircraft uc_aircraft_registration_number; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aircraft
    ADD CONSTRAINT uc_aircraft_registration_number UNIQUE (registration_number);


--
-- TOC entry 3295 (class 2606 OID 57955)
-- Name: airlines uc_airlines_iata_code; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.airlines
    ADD CONSTRAINT uc_airlines_iata_code UNIQUE (iata_code);


--
-- TOC entry 3299 (class 2606 OID 57957)
-- Name: airports uc_airports_iata_code; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.airports
    ADD CONSTRAINT uc_airports_iata_code UNIQUE (iata_code);


--
-- TOC entry 3308 (class 1259 OID 58016)
-- Name: idx_flight_outbox_aggregate; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_flight_outbox_aggregate ON public.flight_outbox_events USING btree (aggregate_type, aggregate_id);


--
-- TOC entry 3309 (class 1259 OID 58017)
-- Name: idx_flight_outbox_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_flight_outbox_created_at ON public.flight_outbox_events USING btree (created_at);


--
-- TOC entry 3310 (class 1259 OID 58018)
-- Name: idx_flight_outbox_event_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_flight_outbox_event_type ON public.flight_outbox_events USING btree (event_type);


--
-- TOC entry 3317 (class 2606 OID 57960)
-- Name: flight_fares fk_flight_fares_on_schedule; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flight_fares
    ADD CONSTRAINT fk_flight_fares_on_schedule FOREIGN KEY (schedule_id) REFERENCES public.flight_schedules(schedule_id);


--
-- TOC entry 3318 (class 2606 OID 58248)
-- Name: flight_schedules fk_flight_schedules_on_aircraft; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flight_schedules
    ADD CONSTRAINT fk_flight_schedules_on_aircraft FOREIGN KEY (aircraft_id) REFERENCES public.aircraft(aircraft_id);


--
-- TOC entry 3319 (class 2606 OID 57985)
-- Name: flight_schedules fk_flight_schedules_on_flight; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flight_schedules
    ADD CONSTRAINT fk_flight_schedules_on_flight FOREIGN KEY (flight_id) REFERENCES public.flights(flight_id);


--
-- TOC entry 3320 (class 2606 OID 58243)
-- Name: flights fk_flights_on_aircraft; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flights
    ADD CONSTRAINT fk_flights_on_aircraft FOREIGN KEY (aircraft_id) REFERENCES public.aircraft(aircraft_id);


--
-- TOC entry 3321 (class 2606 OID 57990)
-- Name: flights fk_flights_on_airline; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flights
    ADD CONSTRAINT fk_flights_on_airline FOREIGN KEY (airline_id) REFERENCES public.airlines(airline_id);


--
-- TOC entry 3322 (class 2606 OID 57995)
-- Name: flights fk_flights_on_arrival_airport; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flights
    ADD CONSTRAINT fk_flights_on_arrival_airport FOREIGN KEY (arrival_airport_id) REFERENCES public.airports(airport_id);


--
-- TOC entry 3323 (class 2606 OID 58000)
-- Name: flights fk_flights_on_departure_airport; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flights
    ADD CONSTRAINT fk_flights_on_departure_airport FOREIGN KEY (departure_airport_id) REFERENCES public.airports(airport_id);


--
-- TOC entry 3469 (class 6104 OID 20250)
-- Name: dbz_publication; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION dbz_publication FOR ALL TABLES WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION dbz_publication OWNER TO postgres;

-- Completed on 2025-09-15 15:15:44

--
-- PostgreSQL database dump complete
--

