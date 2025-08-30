package com.pdh.flight.repository;

import com.pdh.flight.model.FlightSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository interface for FlightSchedule entity
 */
@Repository
public interface FlightScheduleRepository extends JpaRepository<FlightSchedule, UUID> {
    
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
