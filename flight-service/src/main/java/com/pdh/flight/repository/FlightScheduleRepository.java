package com.pdh.flight.repository;

import com.pdh.flight.model.FlightSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Repository interface for FlightSchedule entity
 * Provides CRUD operations and custom queries for flight schedule management
 */
@Repository
public interface FlightScheduleRepository extends JpaRepository<FlightSchedule, UUID> {
    
    /**
     * Find all schedules for a specific flight
     * 
     * @param flightId The flight ID
     * @return List of FlightSchedule records
     */
    @Query("SELECT fs FROM FlightSchedule fs WHERE fs.flightId = :flightId AND fs.isDeleted = false ORDER BY fs.departureTime")
    List<FlightSchedule> findByFlightId(@Param("flightId") Long flightId);
    
    /**
     * Find all schedules for multiple flights
     * 
     * @param flightIds List of flight IDs
     * @return List of FlightSchedule records
     */
    @Query("SELECT fs FROM FlightSchedule fs WHERE fs.flightId IN :flightIds AND fs.isDeleted = false ORDER BY fs.flightId, fs.departureTime")
    List<FlightSchedule> findByFlightIdIn(@Param("flightIds") List<Long> flightIds);
    
    /**
     * Find schedules by flight ID and date range
     * 
     * @param flightId The flight ID
     * @param startDate Start date
     * @param endDate End date
     * @return List of FlightSchedule records
     */
    @Query("SELECT fs FROM FlightSchedule fs WHERE fs.flightId = :flightId AND DATE(fs.departureTime) BETWEEN :startDate AND :endDate AND fs.isDeleted = false ORDER BY fs.departureTime")
    List<FlightSchedule> findByFlightIdAndDateRange(@Param("flightId") Long flightId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    /**
     * Find schedules by flight ID and specific date
     * 
     * @param flightId The flight ID
     * @param departureDate The departure date
     * @return List of FlightSchedule records
     */
    @Query("SELECT fs FROM FlightSchedule fs WHERE fs.flightId = :flightId AND DATE(fs.departureTime) = :departureDate AND fs.isDeleted = false ORDER BY fs.departureTime")
    List<FlightSchedule> findByFlightIdAndDate(@Param("flightId") Long flightId, @Param("departureDate") LocalDate departureDate);
    
    /**
     * Find active schedules by flight ID
     * 
     * @param flightId The flight ID
     * @return List of active FlightSchedule records
     */
    @Query("SELECT fs FROM FlightSchedule fs WHERE fs.flightId = :flightId AND fs.status = 'ACTIVE' AND fs.isDeleted = false ORDER BY fs.departureTime")
    List<FlightSchedule> findActiveByFlightId(@Param("flightId") Long flightId);
    
    /**
     * Count schedules by flight ID
     */
    @Query("SELECT COUNT(fs) FROM FlightSchedule fs WHERE fs.flightId = :flightId AND fs.isDeleted = false")
    Long countByFlightId(@Param("flightId") Long flightId);
    
    /**
     * Count schedules by flight ID and status
     */
    @Query("SELECT COUNT(fs) FROM FlightSchedule fs WHERE fs.flightId = :flightId AND fs.status = :status AND fs.isDeleted = false")
    Long countByFlightIdAndStatus(@Param("flightId") Long flightId, @Param("status") String status);
}
