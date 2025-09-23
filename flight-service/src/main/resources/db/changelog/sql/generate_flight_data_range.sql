CREATE OR REPLACE FUNCTION generate_flight_data_range(start_date DATE, end_date DATE)
RETURNS TABLE(date_generated DATE, schedules_created INTEGER) AS $$
DECLARE
    current_target_date DATE;
    schedules_count INTEGER;
BEGIN
    -- Validate input dates
    IF start_date > end_date THEN
        RAISE EXCEPTION 'Start date must be before or equal to end date';
    END IF;
    
    -- Loop through each date in the range
    current_target_date := start_date;
    WHILE current_target_date <= end_date LOOP
        -- Generate data for current date
        SELECT generate_daily_flight_data(current_target_date) INTO schedules_count;
        
        -- Return the result for this date
        date_generated := current_target_date;
        schedules_created := schedules_count;
        RETURN NEXT;
        
        -- Move to next date
        current_target_date := current_target_date + INTERVAL '1 day';
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;