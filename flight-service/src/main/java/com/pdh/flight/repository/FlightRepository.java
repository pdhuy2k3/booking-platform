package com.pdh.flight.repository;

import com.pdh.flight.model.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {
    
    Optional<Flight> findByFlightNumber(String flightNumber);
    
    List<Flight> findByDepartureAirportAndArrivalAirportAndIsActiveTrue(
            String departureAirport, String arrivalAirport);
    
    List<Flight> findByDepartureCityAndArrivalCityAndIsActiveTrue(
            String departureCity, String arrivalCity);
    
    @Query("SELECT f FROM Flight f WHERE f.isActive = true AND " +
           "f.departureAirport = :from AND f.arrivalAirport = :to AND " +
           "DATE(f.departureTime) = DATE(:date)")
    List<Flight> findFlightsByRouteAndDate(
            @Param("from") String from, 
            @Param("to") String to, 
            @Param("date") LocalDateTime date);
    
    @Query("SELECT f FROM Flight f WHERE f.isActive = true AND " +
           "f.departureTime >= :startTime AND f.departureTime < :endTime")
    List<Flight> findFlightsByDateRange(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
    
    List<Flight> findByAirlineCodeAndIsActiveTrue(String airlineCode);
    
    @Query("SELECT f FROM Flight f WHERE f.isActive = true AND f.availableSeats >= :seats")
    List<Flight> findFlightsWithAvailableSeats(@Param("seats") Integer seats);
    
    @Query("SELECT f FROM Flight f WHERE f.isActive = true AND " +
           "(LOWER(f.departureCity) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(f.arrivalCity) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(f.airlineName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Flight> searchFlights(@Param("keyword") String keyword);
}
