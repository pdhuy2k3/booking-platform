CREATE OR REPLACE FUNCTION update_existing_flight_schedule_statuses()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
    temp_count INTEGER := 0;
    current_time TIMESTAMP := NOW();
BEGIN
    -- Update completed flights
    UPDATE flight_schedules 
    SET status = 'COMPLETED',
        updated_at = current_time,
        updated_by = 'status_migration'
    WHERE arrival_time < current_time 
      AND status IN ('SCHEDULED', 'ACTIVE', 'DELAYED')
      AND is_deleted = false;
      
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Update active flights (departure within next hour)
    UPDATE flight_schedules 
    SET status = 'ACTIVE',
        updated_at = current_time,
        updated_by = 'status_migration'
    WHERE departure_time BETWEEN current_time AND current_time + INTERVAL '1 hour'
      AND status = 'SCHEDULED'
      AND is_deleted = false;
      
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    updated_count := updated_count + temp_count;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;