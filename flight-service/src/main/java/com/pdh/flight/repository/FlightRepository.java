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
        ORDER BY f.flightNumber
        """)
    Page<Flight> findAllWithDetails(Pageable pageable);
}
