package com.pdh.flight.controller;

import com.pdh.flight.model.Flight;
import com.pdh.flight.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Flight Controller
 * Xử lý các API requests liên quan đến chuyến bay
 */
@RestController
@RequiredArgsConstructor
@Slf4j
public class FlightController {
    
    private final FlightRepository flightRepository;

    /**
     * Health check endpoint
     */
    @GetMapping("/backoffice/flight/health")
    public ResponseEntity<Map<String, Object>> health() {
        log.info("Flight service health check requested");
        
        Map<String, Object> healthStatus = Map.of(
                "status", "UP",
                "service", "flight-service",
                "timestamp", LocalDateTime.now(),
                "message", "Flight service is running properly"
        );
        
        return ResponseEntity.ok(healthStatus);
    }

    /**
     * Tìm kiếm chuyến bay
     */
    @GetMapping("/backoffice/flight/search")
    public ResponseEntity<List<Flight>> searchFlights(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String keyword) {
        
        log.info("Searching flights from {} to {} with keyword: {}", from, to, keyword);
        
        List<Flight> flights;
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            flights = flightRepository.searchFlights(keyword);
        } else if (from != null && to != null) {
            flights = flightRepository.findByDepartureAirportAndArrivalAirportAndIsActiveTrue(from, to);
        } else {
            flights = flightRepository.findAll();
        }
        
        log.info("Found {} flights", flights.size());
        return ResponseEntity.ok(flights);
    }

    /**
     * Lấy thông tin chi tiết chuyến bay
     */
    @GetMapping("/backoffice/flight/{flightId}")
    public ResponseEntity<Flight> getFlightDetails(@PathVariable Long flightId) {
        log.info("Getting flight details for ID: {}", flightId);
        
        return flightRepository.findById(flightId)
                .map(flight -> {
                    log.info("Found flight: {}", flight.getFlightNumber());
                    return ResponseEntity.ok(flight);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Lấy chuyến bay theo flight number
     */
    @GetMapping("/backoffice/flight/number/{flightNumber}")
    public ResponseEntity<Flight> getFlightByNumber(@PathVariable String flightNumber) {
        log.info("Getting flight details for flight number: {}", flightNumber);
        
        return flightRepository.findByFlightNumber(flightNumber)
                .map(flight -> {
                    log.info("Found flight: {} - {}", flight.getFlightNumber(), 
                            flight.getAirline() != null ? flight.getAirline().getName() : "Unknown Airline");
                    return ResponseEntity.ok(flight);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Lấy chuyến bay theo hãng hàng không
     */
    @GetMapping("/backoffice/flight/airline/{airlineCode}")
    public ResponseEntity<List<Flight>> getFlightsByAirline(@PathVariable String airlineCode) {
        log.info("Getting flights for airline: {}", airlineCode);
        
        List<Flight> flights = flightRepository.findByAirlineCodeAndIsActiveTrue(airlineCode);
        log.info("Found {} flights for airline: {}", flights.size(), airlineCode);
        
        return ResponseEntity.ok(flights);
    }

    /**
     * Lấy chuyến bay có ghế trống
     */
    @GetMapping("/backoffice/flight/available")
    public ResponseEntity<List<Flight>> getAvailableFlights(
            @RequestParam(defaultValue = "1") Integer minSeats) {
        
        log.info("Getting flights with at least {} available seats", minSeats);
        
        List<Flight> flights = flightRepository.findFlightsWithAvailableSeats(minSeats);
        log.info("Found {} flights with available seats", flights.size());
        
        return ResponseEntity.ok(flights);
    }
}
