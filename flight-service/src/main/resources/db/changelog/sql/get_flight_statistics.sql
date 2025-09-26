DROP FUNCTION get_flight_statistics(date) ;
CREATE OR REPLACE FUNCTION get_flight_statistics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
    total_schedules INTEGER,
    scheduled_count INTEGER,
    active_count INTEGER,
    delayed_count INTEGER,
    cancelled_count INTEGER,
    completed_count INTEGER,
    total_flights INTEGER,
    unique_routes INTEGER
) AS $$
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
$$ LANGUAGE plpgsql;