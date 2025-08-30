package com.pdh.flight.repository;

import com.pdh.flight.model.Flight;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {

    /**
     * Find flights by route (origin and destination airports)
     */
    @Query("""
        SELECT f FROM Flight f
        JOIN FETCH f.airline
        JOIN FETCH f.departureAirport da
        JOIN FETCH f.arrivalAirport aa
        WHERE da.iataCode = :origin
        AND aa.iataCode = :destination
        ORDER BY f.flightNumber
        """)
    Page<Flight> findFlightsByRoute(
        @Param("origin") String origin,
        @Param("destination") String destination,
        @Param("departureDate") LocalDate departureDate,
        Pageable pageable
    );

    /**
     * Find flights by flight number
     */
    @Query("""
        SELECT f FROM Flight f
        JOIN FETCH f.airline
        JOIN FETCH f.departureAirport
        JOIN FETCH f.arrivalAirport
        WHERE f.flightNumber = :flightNumber
        """)
    Optional<Flight> findByFlightNumberWithDetails(@Param("flightNumber") String flightNumber);

    /**
     * Find all flights with details (for admin/backoffice)
     */
    @Query("""
        SELECT f FROM Flight f
        JOIN FETCH f.airline
        JOIN FETCH f.departureAirport
        JOIN FETCH f.arrivalAirport
        WHERE f.isDeleted = false
        ORDER BY f.flightNumber
        """)
    Page<Flight> findAllWithDetails(Pageable pageable);
    
    /**
     * Count flights by status
     */
    @Query("SELECT COUNT(f) FROM Flight f WHERE f.status = :status AND f.isDeleted = false")
    long countByStatus(@Param("status") String status);
    
    /**
     * Find flights by airline
     */
    @Query("""
        SELECT f FROM Flight f
        JOIN FETCH f.airline a
        JOIN FETCH f.departureAirport
        JOIN FETCH f.arrivalAirport
        WHERE a.airlineId = :airlineId AND f.isDeleted = false
        """)
    Page<Flight> findByAirlineId(@Param("airlineId") Long airlineId, Pageable pageable);
    
    /**
     * Find flights by departure airport
     */
    @Query("""
        SELECT f FROM Flight f
        JOIN FETCH f.airline
        JOIN FETCH f.departureAirport da
        JOIN FETCH f.arrivalAirport
        WHERE da.airportId = :airportId AND f.isDeleted = false
        """)
    Page<Flight> findByDepartureAirportId(@Param("airportId") Long airportId, Pageable pageable);
    
    /**
     * Find flights by arrival airport
     */
    @Query("""
        SELECT f FROM Flight f
        JOIN FETCH f.airline
        JOIN FETCH f.departureAirport
        JOIN FETCH f.arrivalAirport aa
        WHERE aa.airportId = :airportId AND f.isDeleted = false
        """)
    Page<Flight> findByArrivalAirportId(@Param("airportId") Long airportId, Pageable pageable);
    
    /**
     * Count flights by airline ID
     */
    @Query("SELECT COUNT(f) FROM Flight f WHERE f.airline.airlineId = :airlineId AND f.isDeleted = false")
    Long countByAirlineId(@Param("airlineId") Long airlineId);
    
    /**
     * Count flights by airline ID and status
     */
    @Query("SELECT COUNT(f) FROM Flight f WHERE f.airline.airlineId = :airlineId AND f.status = :status AND f.isDeleted = false")
    Long countByAirlineIdAndStatus(@Param("airlineId") Long airlineId, @Param("status") String status);
    
    /**
     * Count flights by departure airport ID
     */
    @Query("SELECT COUNT(f) FROM Flight f WHERE f.departureAirport.airportId = :airportId AND f.isDeleted = false")
    Long countByDepartureAirportId(@Param("airportId") Long airportId);
    
    /**
     * Count flights by arrival airport ID
     */
    @Query("SELECT COUNT(f) FROM Flight f WHERE f.arrivalAirport.airportId = :airportId AND f.isDeleted = false")
    Long countByArrivalAirportId(@Param("airportId") Long airportId);
    
    /**
     * Count flights by departure airport ID and status
     */
    @Query("SELECT COUNT(f) FROM Flight f WHERE f.departureAirport.airportId = :airportId AND f.status = :status AND f.isDeleted = false")
    Long countByDepartureAirportIdAndStatus(@Param("airportId") Long airportId, @Param("status") String status);
    
    /**
     * Count flights by arrival airport ID and status
     */
    @Query("SELECT COUNT(f) FROM Flight f WHERE f.arrivalAirport.airportId = :airportId AND f.status = :status AND f.isDeleted = false")
    Long countByArrivalAirportIdAndStatus(@Param("airportId") Long airportId, @Param("status") String status);
}
