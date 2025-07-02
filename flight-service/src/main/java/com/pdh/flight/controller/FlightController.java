package com.pdh.flight.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

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
     * Demo endpoint cho việc test service discovery
     */
    @GetMapping("/backoffice/flight/search")
    public ResponseEntity<List<Map<String, Object>>> searchFlights(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String date) {

        log.info("Searching flights from {} to {} on {}", from, to, date);

        // Mock data for demo
        Map<String, Object> flight1 = Map.of(
                "id", "VN123",
                "airline", "Vietnam Airlines",
                "from", from != null ? from : "SGN",
                "to", to != null ? to : "HAN",
                "departure", "08:00",
                "arrival", "10:00",
                "price", 2500000,
                "currency", "VND"
        );

        Map<String, Object> flight2 = Map.of(
                "id", "VJ456",
                "airline", "VietJet Air",
                "from", from != null ? from : "SGN",
                "to", to != null ? to : "HAN",
                "departure", "14:30",
                "arrival", "16:30",
                "price", 1800000,
                "currency", "VND"
        );

        List<Map<String, Object>> flights = List.of(flight1, flight2);
        flights.forEach(flight -> log.info("Found flight: {}", flight));

        return ResponseEntity.ok(flights);
    }

    /**
     * Lấy thông tin chi tiết chuyến bay
     */
    @GetMapping("/backoffice/flight/{flightId}")
    public ResponseEntity<Map<String, Object>> getFlightDetails(@PathVariable String flightId) {
        log.info("Getting flight details for ID: {}", flightId);
        
        Map<String, Object> flightDetails = Map.of(
                "id", flightId,
                "airline", "Vietnam Airlines",
                "from", "SGN",
                "to", "HAN",
                "departure", "08:00",
                "arrival", "10:00",
                "price", 2500000,
                "currency", "VND",
                "status", "On Time"
        );
        
        return ResponseEntity.ok(flightDetails);
    }
}
