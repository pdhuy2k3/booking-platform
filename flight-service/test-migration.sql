-- Test script to validate all PostgreSQL functions exist
-- Run this in your PostgreSQL database to check if all functions are available

-- Test 1: Check if generate_daily_flight_data function exists
SELECT EXISTS (
    SELECT 1 FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' AND p.proname = 'generate_daily_flight_data'
) as generate_daily_exists;

-- Test 2: Check if generate_flight_data_range function exists
SELECT EXISTS (
    SELECT 1 FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' AND p.proname = 'generate_flight_data_range'
) as generate_range_exists;

-- Test 3: Check if cleanup_old_flight_data function exists
SELECT EXISTS (
    SELECT 1 FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' AND p.proname = 'cleanup_old_flight_data'
) as cleanup_exists;

-- Test 4: Check if get_flight_statistics function exists
SELECT EXISTS (
    SELECT 1 FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' AND p.proname = 'get_flight_statistics'
) as statistics_exists;

-- Test 5: Check flight schedules table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'flight_schedules' 
ORDER BY ordinal_position;

-- Test 6: Check flight fares table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'flight_fares' 
ORDER BY ordinal_position;

-- Test 7: Check unique constraints
SELECT conname, contype 
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname IN ('flight_schedules', 'flight_fares')
AND contype = 'u';