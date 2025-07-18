package com.pdh.flight.repository;

import com.pdh.flight.model.FlightInventory;
import com.pdh.flight.model.enums.FareClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for FlightInventory entity
 * Provides CRUD operations and custom queries for flight inventory management
 */
@Repository
public interface FlightInventoryRepository extends JpaRepository<FlightInventory, Long> {

    /**
     * Find flight inventory by flight leg ID and fare class
     * 
     * @param flightLegId The flight leg ID
     * @param fareClass The fare class
     * @return Optional FlightInventory
     */
    Optional<FlightInventory> findByFlightLegIdAndFareClass(Long flightLegId, FareClass fareClass);

    /**
     * Find all inventory records for a flight leg
     * 
     * @param flightLegId The flight leg ID
     * @return List of FlightInventory records
     */
    List<FlightInventory> findByFlightLegId(Long flightLegId);

    /**
     * Find inventory records with available seats
     * 
     * @param flightLegId The flight leg ID
     * @return List of FlightInventory records with available seats
     */
    @Query("SELECT fi FROM FlightInventory fi WHERE fi.flightLegId = :flightLegId AND fi.totalSeats > fi.reservedSeats")
    List<FlightInventory> findAvailableInventoryByFlightLegId(@Param("flightLegId") Long flightLegId);

    /**
     * Get total available seats for a flight leg across all fare classes
     * 
     * @param flightLegId The flight leg ID
     * @return Total available seats
     */
    @Query("SELECT SUM(fi.totalSeats - fi.reservedSeats) FROM FlightInventory fi WHERE fi.flightLegId = :flightLegId")
    Integer getTotalAvailableSeats(@Param("flightLegId") Long flightLegId);

    /**
     * Get available seats for a specific fare class
     * 
     * @param flightLegId The flight leg ID
     * @param fareClass The fare class
     * @return Available seats count
     */
    @Query("SELECT (fi.totalSeats - fi.reservedSeats) FROM FlightInventory fi WHERE fi.flightLegId = :flightLegId AND fi.fareClass = :fareClass")
    Integer getAvailableSeatsForFareClass(@Param("flightLegId") Long flightLegId, @Param("fareClass") FareClass fareClass);

    /**
     * Check if minimum seats are available for a fare class
     * 
     * @param flightLegId The flight leg ID
     * @param fareClass The fare class
     * @param minSeats Minimum required seats
     * @return true if available, false otherwise
     */
    @Query("SELECT CASE WHEN (fi.totalSeats - fi.reservedSeats) >= :minSeats THEN true ELSE false END " +
           "FROM FlightInventory fi WHERE fi.flightLegId = :flightLegId AND fi.fareClass = :fareClass")
    Boolean hasMinimumSeatsAvailable(@Param("flightLegId") Long flightLegId, 
                                   @Param("fareClass") FareClass fareClass, 
                                   @Param("minSeats") Integer minSeats);

    /**
     * Find inventory records that need attention (low availability)
     * 
     * @param threshold The threshold for low availability
     * @return List of FlightInventory records with low availability
     */
    @Query("SELECT fi FROM FlightInventory fi WHERE (fi.totalSeats - fi.reservedSeats) <= :threshold AND fi.totalSeats > fi.reservedSeats")
    List<FlightInventory> findLowAvailabilityInventory(@Param("threshold") Integer threshold);
}
