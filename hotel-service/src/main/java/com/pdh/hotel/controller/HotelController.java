package com.pdh.hotel.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Hotel Controller
 * Xử lý các API requests liên quan đến khách sạn
 */
@RestController
@RequiredArgsConstructor
@Slf4j
public class HotelController {

    /**
     * Health check endpoint
     */
    @GetMapping("/backoffice/hotel/health")
    public ResponseEntity<Map<String, Object>> health() {
        log.info("Hotel service health check requested");
        
        Map<String, Object> healthStatus = Map.of(
            "status", "UP",
            "service", "hotel-service",
            "timestamp", LocalDateTime.now(),
            "message", "Hotel Service is running properly"
        );
        
        return ResponseEntity.ok(healthStatus);
    }

    /**
     * Lấy thông tin chi tiết khách sạn
     */
    @GetMapping("/backoffice/hotel/{hotelId}")
    public ResponseEntity<Long> getHotelDetails(@PathVariable Long hotelId) {
        log.info("Getting hotel details for ID: {}", hotelId);
        
        return ResponseEntity.ok(hotelId);
    }

    // === BOOKING INTEGRATION ENDPOINTS ===
    
    /**
     * Reserve hotel for booking (called by Booking Service)
     */
    @PostMapping("/hotels/reserve")
    public ResponseEntity<Map<String, Object>> reserveHotel(@RequestBody Map<String, Object> request) {
        log.info("Hotel reservation request: {}", request);
        
        String bookingId = (String) request.get("bookingId");
        String sagaId = (String) request.get("sagaId");
        // String customerId = (String) request.get("customerId"); // For future use
        
        // Mock implementation - in real scenario, this would:
        // 1. Check hotel room availability
        // 2. Create temporary reservation
        // 3. Return reservation details
        
        Map<String, Object> response = Map.of(
            "status", "success",
            "message", "Hotel reservation created",
            "reservationId", "HTL-" + bookingId,
            "bookingId", bookingId,
            "sagaId", sagaId
        );
        
        log.info("Hotel reservation response: {}", response);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Cancel hotel reservation (compensation)
     */
    @PostMapping("/hotels/cancel-reservation")
    public ResponseEntity<Map<String, Object>> cancelHotelReservation(@RequestBody Map<String, Object> request) {
        log.info("Hotel cancellation request: {}", request);
        
        String bookingId = (String) request.get("bookingId");
        String sagaId = (String) request.get("sagaId");
        String reason = (String) request.get("reason");
        
        // Mock implementation - in real scenario, this would:
        // 1. Find and cancel the reservation
        // 2. Free up the rooms
        // 3. Update reservation status
        
        Map<String, Object> response = Map.of(
            "status", "success",
            "message", "Hotel reservation cancelled",
            "bookingId", bookingId,
            "sagaId", sagaId,
            "reason", reason
        );
        
        log.info("Hotel cancellation response: {}", response);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Confirm hotel reservation (final step)
     */
    @PostMapping("/hotels/confirm-reservation")
    public ResponseEntity<Map<String, Object>> confirmHotelReservation(@RequestBody Map<String, Object> request) {
        log.info("Hotel confirmation request: {}", request);
        
        String bookingId = (String) request.get("bookingId");
        String sagaId = (String) request.get("sagaId");
        String confirmationNumber = (String) request.get("confirmationNumber");
        
        // Mock implementation - in real scenario, this would:
        // 1. Convert temporary reservation to confirmed booking
        // 2. Generate vouchers
        // 3. Send confirmation to customer
        
        Map<String, Object> response = Map.of(
            "status", "success",
            "message", "Hotel reservation confirmed",
            "bookingId", bookingId,
            "sagaId", sagaId,
            "confirmationNumber", confirmationNumber,
            "voucherNumber", "VCH-" + bookingId
        );
        
        log.info("Hotel confirmation response: {}", response);
        return ResponseEntity.ok(response);
    }
}
