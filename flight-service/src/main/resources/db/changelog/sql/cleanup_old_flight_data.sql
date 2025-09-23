CREATE OR REPLACE FUNCTION cleanup_old_flight_data(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    cutoff_date DATE;
BEGIN
    -- Calculate cutoff date
    cutoff_date := CURRENT_DATE - INTERVAL '1 day' * days_to_keep;
    
    -- Delete flight fares for old schedules first (to maintain referential integrity)
    DELETE FROM flight_fares ff 
    WHERE ff.schedule_id IN (
        SELECT fs.schedule_id 
        FROM flight_schedules fs 
        WHERE DATE(fs.departure_time) < cutoff_date
        AND fs.is_deleted = false
    );
    
    -- Delete old flight schedules and get count
    DELETE FROM flight_schedules 
    WHERE DATE(departure_time) < cutoff_date
    AND is_deleted = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;