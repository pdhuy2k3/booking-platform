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

    // === BOOKING INTEGRATION ENDPOINTS ===
    
    /**
     * Reserve flight for booking (called by Booking Service)
     */
    @PostMapping("/flights/reserve")
    public ResponseEntity<Map<String, Object>> reserveFlight(@RequestBody Map<String, Object> request) {
        log.info("Flight reservation request: {}", request);
        
        String bookingId = (String) request.get("bookingId");
        String sagaId = (String) request.get("sagaId");
        // String customerId = (String) request.get("customerId"); // For future use
        
        // Mock implementation - in real scenario, this would:
        // 1. Check flight availability
        // 2. Create temporary reservation
        // 3. Return reservation details
        
        Map<String, Object> response = Map.of(
            "status", "success",
            "message", "Flight reservation created",
            "reservationId", "FLT-" + bookingId,
            "bookingId", bookingId,
            "sagaId", sagaId
        );
        
        log.info("Flight reservation response: {}", response);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Cancel flight reservation (compensation)
     */
    @PostMapping("/flights/cancel-reservation")
    public ResponseEntity<Map<String, Object>> cancelFlightReservation(@RequestBody Map<String, Object> request) {
        log.info("Flight cancellation request: {}", request);
        
        String bookingId = (String) request.get("bookingId");
        String sagaId = (String) request.get("sagaId");
        String reason = (String) request.get("reason");
        
        // Mock implementation - in real scenario, this would:
        // 1. Find and cancel the reservation
        // 2. Free up the seats
        // 3. Update reservation status
        
        Map<String, Object> response = Map.of(
            "status", "success",
            "message", "Flight reservation cancelled",
            "bookingId", bookingId,
            "sagaId", sagaId,
            "reason", reason
        );
        
        log.info("Flight cancellation response: {}", response);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Confirm flight reservation (final step)
     */
    @PostMapping("/flights/confirm-reservation")
    public ResponseEntity<Map<String, Object>> confirmFlightReservation(@RequestBody Map<String, Object> request) {
        log.info("Flight confirmation request: {}", request);
        
        String bookingId = (String) request.get("bookingId");
        String sagaId = (String) request.get("sagaId");
        String confirmationNumber = (String) request.get("confirmationNumber");
        
        // Mock implementation - in real scenario, this would:
        // 1. Convert temporary reservation to confirmed booking
        // 2. Generate tickets
        // 3. Send confirmation to customer
        
        Map<String, Object> response = Map.of(
            "status", "success",
            "message", "Flight reservation confirmed",
            "bookingId", bookingId,
            "sagaId", sagaId,
            "confirmationNumber", confirmationNumber,
            "ticketNumber", "TKT-" + bookingId
        );
        
        log.info("Flight confirmation response: {}", response);
        return ResponseEntity.ok(response);
    }


}
