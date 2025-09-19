package com.pdh.flight.repository;

import com.pdh.flight.model.FlightFare;
import com.pdh.flight.model.enums.FareClass;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for FlightFare entity
 * Provides CRUD operations and custom queries for flight fare management
 */
@Repository
public interface FlightFareRepository extends JpaRepository<FlightFare, UUID> {
    
    /**
     * Find all fares for a specific schedule
     * 
     * @param scheduleId The flight schedule ID
     * @return List of FlightFare records
     */
    @Query("SELECT ff FROM FlightFare ff WHERE ff.scheduleId = :scheduleId AND ff.isDeleted = false ORDER BY ff.fareClass")
    List<FlightFare> findByScheduleId(@Param("scheduleId") UUID scheduleId);
    
    /**
     * Find all fares for multiple schedules
     * 
     * @param scheduleIds List of flight schedule IDs
     * @return List of FlightFare records
     */
    @Query("SELECT ff FROM FlightFare ff WHERE ff.scheduleId IN :scheduleIds AND ff.isDeleted = false ORDER BY ff.scheduleId, ff.fareClass")
    List<FlightFare> findByScheduleIdIn(@Param("scheduleIds") List<UUID> scheduleIds);
    
    /**
     * Find fare by schedule ID and fare class
     * 
     * @param scheduleId The flight schedule ID
     * @param fareClass The fare class (ECONOMY, BUSINESS, FIRST)
     * @return FlightFare record or null
     */
    @Query("SELECT ff FROM FlightFare ff WHERE ff.scheduleId = :scheduleId AND ff.fareClass = :fareClass AND ff.isDeleted = false")
    FlightFare findByScheduleIdAndFareClass(@Param("scheduleId") UUID scheduleId, @Param("fareClass") FareClass fareClass);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ff FROM FlightFare ff WHERE ff.scheduleId = :scheduleId AND ff.fareClass = :fareClass AND ff.isDeleted = false")
    Optional<FlightFare> findByScheduleIdAndFareClassForUpdate(@Param("scheduleId") UUID scheduleId, @Param("fareClass") FareClass fareClass);
    
    /**
     * Find all fares for flights with available seats
     * 
     * @param scheduleIds List of flight schedule IDs
     * @return List of FlightFare records with available seats > 0
     */
    @Query("SELECT ff FROM FlightFare ff WHERE ff.scheduleId IN :scheduleIds AND ff.availableSeats > 0 AND ff.isDeleted = false ORDER BY ff.scheduleId, ff.price")
    List<FlightFare> findAvailableFaresByScheduleIds(@Param("scheduleIds") List<UUID> scheduleIds);
    
    // Additional methods for backoffice management
    
    /**
     * Find all active flight fares with pagination
     */
    Page<FlightFare> findByIsDeletedFalse(Pageable pageable);
    
    /**
     * Find flight fares by schedule ID with pagination
     */
    Page<FlightFare> findByScheduleIdAndIsDeletedFalse(UUID scheduleId, Pageable pageable);
    
    /**
     * Find flight fares by fare class with pagination
     */
    Page<FlightFare> findByFareClassAndIsDeletedFalse(FareClass fareClass, Pageable pageable);
    
    /**
     * Find flight fares by schedule ID and fare class with pagination
     */
    Page<FlightFare> findByScheduleIdAndFareClassAndIsDeletedFalse(UUID scheduleId, FareClass fareClass, Pageable pageable);
    
    /**
     * Count statistics methods
     */
    long countByIsDeletedFalse();
    
    long countByFareClassAndIsDeletedFalse(FareClass fareClass);
}
