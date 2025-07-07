package com.pdh.flight.controller;

import com.pdh.flight.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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
                "messages", "Flight service is running properly"
        );
        
        return ResponseEntity.ok(healthStatus);
    }



    /**
     * Lấy thông tin chi tiết chuyến bay
     */
    @GetMapping("/backoffice/flight/{flightId}")
    public ResponseEntity<Long> getFlightDetails(@PathVariable Long flightId) {
        log.info("Getting flight details for ID: {}", flightId);
        
        return ResponseEntity.ok(flightId);
    }


}
