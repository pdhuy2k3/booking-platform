package com.pdh.flight.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.util.Map;

/**
 * Service for generating daily flight data for demo purposes
 */
@Service
public class FlightDataGeneratorService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Generate flight schedules and fares for a specific date
     * @param targetDate The date to generate data for (default: tomorrow)
     * @return Number of schedules created
     */
    @Transactional
    public Integer generateDailyFlightData(LocalDate targetDate) {
        if (targetDate == null) {
            targetDate = LocalDate.now().plusDays(1);
        }
        
        String sql = "SELECT generate_daily_flight_data(?::DATE) as schedules_created";
        return jdbcTemplate.queryForObject(sql, Integer.class, Date.valueOf(targetDate));
    }

    /**
     * Generate flight data for a range of dates
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return Map with date and number of schedules created for each date
     */
    @Transactional
    public Map<String, Object> generateFlightDataRange(LocalDate startDate, LocalDate endDate) {
        String sql = "SELECT * FROM generate_flight_data_range(?::DATE, ?::DATE)";
        
        return jdbcTemplate.query(sql, rs -> {
            Map<String, Object> result = new java.util.HashMap<>();
            while (rs.next()) {
                String date = rs.getDate("date_generated").toString();
                Integer schedules = rs.getInt("schedules_created");
                result.put(date, schedules);
            }
            return result;
        }, Date.valueOf(startDate), Date.valueOf(endDate));
    }

    /**
     * Clean up old flight data
     * @param daysToKeep Number of days to keep (default: 30)
     * @return Number of schedules deleted
     */
    @Transactional
    public Integer cleanupOldFlightData(Integer daysToKeep) {
        if (daysToKeep == null) {
            daysToKeep = 30;
        }
        
        String sql = "SELECT cleanup_old_flight_data(?) as deleted_schedules";
        return jdbcTemplate.queryForObject(sql, Integer.class, daysToKeep);
    }

    /**
     * Get flight statistics for a specific date
     * @param targetDate The date to get statistics for (default: today)
     * @return Flight statistics
     */
    public Map<String, Object> getFlightStatistics(LocalDate targetDate) {
        if (targetDate == null) {
            targetDate = LocalDate.now();
        }
        
        String sql = "SELECT * FROM get_flight_statistics(?::DATE)";
        
        return jdbcTemplate.queryForMap(sql, Date.valueOf(targetDate));
    }

    /**
     * Generate data for the next N days
     * @param numberOfDays Number of days to generate data for
     * @return Summary of generated data
     */
    @Transactional
    public Map<String, Object> generateDataForNextDays(Integer numberOfDays) {
        if (numberOfDays == null) {
            numberOfDays = 7;
        }
        
        LocalDate startDate = LocalDate.now().plusDays(1);
        LocalDate endDate = startDate.plusDays(numberOfDays - 1);
        
        Map<String, Object> result = generateFlightDataRange(startDate, endDate);
        
        // Calculate total schedules
        Integer totalSchedules = result.values().stream()
                .mapToInt(v -> (Integer) v)
                .sum();
        
        result.put("total_schedules", totalSchedules);
        result.put("start_date", startDate.toString());
        result.put("end_date", endDate.toString());
        result.put("number_of_days", numberOfDays);
        
        return result;
    }
}
