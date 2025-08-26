package com.pdh.flight.repository;

import com.pdh.flight.model.FlightLeg;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for FlightLeg entity
 * Provides CRUD operations and custom queries for flight leg management
 */
@Repository
public interface FlightLegRepository extends JpaRepository<FlightLeg, Long> {

    /**
     * Find flight legs by flight ID and departure date
     *
     * @param flightId The flight ID
     * @param departureDate The departure date
     * @return List of FlightLeg records
     */
    @Query("SELECT fl FROM FlightLeg fl WHERE fl.flight.flightId = :flightId AND DATE(fl.departureTime) = :departureDate ORDER BY fl.legNumber")
    List<FlightLeg> findByFlightIdAndDepartureDate(@Param("flightId") Long flightId, @Param("departureDate") LocalDate departureDate);

    /**
     * Find flight legs by flight ID
     *
     * @param flightId The flight ID
     * @return List of FlightLeg records
     */
    @Query("""
        SELECT fl FROM FlightLeg fl 
        JOIN FETCH fl.flight f
        JOIN FETCH f.airline
        JOIN FETCH fl.departureAirport
        JOIN FETCH fl.arrivalAirport
        WHERE f.flightId = :flightId 
        ORDER BY fl.legNumber
    """)
    List<FlightLeg> findByFlightIdOrderByLegNumber(Long flightId);

    /**
     * Find flight legs by departure and arrival airports
     * 
     * @param departureAirportId Departure airport ID
     * @param arrivalAirportId Arrival airport ID
     * @return List of FlightLeg records
     */
    @Query("""
        SELECT fl FROM FlightLeg fl 
        JOIN FETCH fl.flight f
        JOIN FETCH f.airline
        JOIN FETCH fl.departureAirport
        JOIN FETCH fl.arrivalAirport
        WHERE fl.departureAirport.airportId = :departureAirportId 
        AND fl.arrivalAirport.airportId = :arrivalAirportId
        ORDER BY fl.departureTime
    """)
    List<FlightLeg> findByDepartureAirportIdAndArrivalAirportId(Long departureAirportId, Long arrivalAirportId);

    /**
     * Find flight legs departing within a time range
     *
     * @param startTime Start time
     * @param endTime End time
     * @return List of FlightLeg records
     */
    @Query("SELECT fl FROM FlightLeg fl WHERE fl.departureTime BETWEEN :startTime AND :endTime ORDER BY fl.departureTime")
    List<FlightLeg> findByDepartureTimeBetween(@Param("startTime") ZonedDateTime startTime, @Param("endTime") ZonedDateTime endTime);

    /**
     * Find flight legs arriving within a time range
     *
     * @param startTime Start time
     * @param endTime End time
     * @return List of FlightLeg records
     */
    @Query("SELECT fl FROM FlightLeg fl WHERE fl.arrivalTime BETWEEN :startTime AND :endTime ORDER BY fl.arrivalTime")
    List<FlightLeg> findByArrivalTimeBetween(@Param("startTime") ZonedDateTime startTime, @Param("endTime") ZonedDateTime endTime);

    /**
     * Find the first leg of a flight (leg number = 1)
     *
     * @param flightId The flight ID
     * @param departureDate The departure date
     * @return Optional FlightLeg
     */
    @Query("SELECT fl FROM FlightLeg fl WHERE fl.flight.flightId = :flightId AND DATE(fl.departureTime) = :departureDate AND fl.legNumber = 1")
    Optional<FlightLeg> findFirstLegByFlightIdAndDate(@Param("flightId") Long flightId, @Param("departureDate") LocalDate departureDate);

    /**
     * Find the last leg of a flight (highest leg number)
     *
     * @param flightId The flight ID
     * @param departureDate The departure date
     * @return Optional FlightLeg
     */
    @Query("SELECT fl FROM FlightLeg fl WHERE fl.flight.flightId = :flightId AND DATE(fl.departureTime) = :departureDate ORDER BY fl.legNumber DESC LIMIT 1")
    Optional<FlightLeg> findLastLegByFlightIdAndDate(@Param("flightId") Long flightId, @Param("departureDate") LocalDate departureDate);

    /**
     * Count flight legs for a flight on a specific date
     * 
     * @param flightId The flight ID
     * @param departureDate The departure date
     * @return Number of legs
     */
    @Query("SELECT COUNT(fl) FROM FlightLeg fl WHERE fl.flight.flightId = :flightId AND DATE(fl.departureTime) = :departureDate")
    Long countByFlightIdAndDate(@Param("flightId") Long flightId, @Param("departureDate") LocalDate departureDate);

    /**
     * Find flight legs by route (departure and arrival airports) on a specific date
     * 
     * @param departureAirportId Departure airport ID
     * @param arrivalAirportId Arrival airport ID
     * @param departureDate Departure date
     * @return List of FlightLeg records
     */
    @Query("SELECT fl FROM FlightLeg fl WHERE fl.departureAirport.airportId = :departureAirportId " +
           "AND fl.arrivalAirport.airportId = :arrivalAirportId AND DATE(fl.departureTime) = :departureDate " +
           "ORDER BY fl.departureTime")
    List<FlightLeg> findByRouteAndDate(@Param("departureAirportId") Long departureAirportId,
                                      @Param("arrivalAirportId") Long arrivalAirportId,
                                      @Param("departureDate") LocalDate departureDate);
}
