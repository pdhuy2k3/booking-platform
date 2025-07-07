package com.pdh.booking.controller;

import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
public class BookingController {
    
    private final BookingRepository bookingRepository;

    /**
     * Health check endpoint
     */
    @GetMapping("/backoffice/booking/health")
    public ResponseEntity<Map<String, Object>> health() {
        log.info("Booking service health check requested");
        
        Map<String, Object> healthStatus = Map.of(
                "status", "UP",
                "service", "booking-service",
                "timestamp", LocalDateTime.now(),
                "messages", "Booking service is running properly"
        );
        
        return ResponseEntity.ok(healthStatus);
    }

    /**
     * Tạo booking mới
     */
    @PostMapping("/backoffice/booking")
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        log.info("Creating new booking for user: {}", booking.getUserId());
        
        // Generate booking reference
        String bookingRef = "BK" + System.currentTimeMillis();
        booking.setBookingReference(bookingRef);
        booking.setStatus(BookingStatus.PENDING);
        
        Booking savedBooking = bookingRepository.save(booking);
        log.info("Created booking with reference: {}", savedBooking.getBookingReference());
        
        return ResponseEntity.ok(savedBooking);
    }

    /**
     * Lấy danh sách booking của user
     */
    @GetMapping("/backoffice/booking/user/{userId}")
    public ResponseEntity<List<Booking>> getUserBookings(@PathVariable String userId) {
        log.info("Getting bookings for user: {}", userId);
        
        UUID userUuid = UUID.fromString(userId);
        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userUuid);
        log.info("Found {} bookings for user: {}", bookings.size(), userId);
        
        return ResponseEntity.ok(bookings);
    }

    /**
     * Lấy thông tin chi tiết booking
     */
    @GetMapping("/backoffice/booking/{bookingReference}")
    public ResponseEntity<Booking> getBookingDetails(@PathVariable String bookingReference) {
        log.info("Getting booking details for reference: {}", bookingReference);
        
        return bookingRepository.findByBookingReference(bookingReference)
                .map(booking -> {
                    log.info("Found booking: {} with status: {}", booking.getBookingReference(), booking.getStatus());
                    return ResponseEntity.ok(booking);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cập nhật trạng thái booking
     */
    @PutMapping("/backoffice/booking/{bookingReference}/status")
    public ResponseEntity<Booking> updateBookingStatus(
            @PathVariable String bookingReference,
            @RequestParam BookingStatus status) {
        
        log.info("Updating booking {} status to: {}", bookingReference, status);
        
        return bookingRepository.findByBookingReference(bookingReference)
                .map(booking -> {
                    booking.setStatus(status);
                    if (status == BookingStatus.CANCELLED) {
                        booking.setCancelledAt(ZonedDateTime.now());
                    }
                    Booking updatedBooking = bookingRepository.save(booking);
                    log.info("Updated booking status successfully");
                    return ResponseEntity.ok(updatedBooking);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Hủy booking
     */
    @PutMapping("/backoffice/booking/{bookingReference}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @PathVariable String bookingReference,
            @RequestParam(required = false) String reason) {
        
        log.info("Cancelling booking: {} with reason: {}", bookingReference, reason);
        
        return bookingRepository.findByBookingReference(bookingReference)
                .map(booking -> {
                    booking.setStatus(BookingStatus.CANCELLED);
                    booking.setCancelledAt(ZonedDateTime.now());
                    booking.setCancellationReason(reason);
                    
                    Booking cancelledBooking = bookingRepository.save(booking);
                    log.info("Cancelled booking successfully");
                    return ResponseEntity.ok(cancelledBooking);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Lấy thống kê booking
     */
    @GetMapping("/backoffice/booking/stats")
    public ResponseEntity<Map<String, Object>> getBookingStats() {
        log.info("Getting booking statistics");
        
        long totalBookings = bookingRepository.count();
        long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);
        long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long cancelledBookings = bookingRepository.countByStatus(BookingStatus.CANCELLED);
        
        Map<String, Object> stats = Map.of(
                "totalBookings", totalBookings,
                "pendingBookings", pendingBookings,
                "confirmedBookings", confirmedBookings,
                "cancelledBookings", cancelledBookings,
                "timestamp", LocalDateTime.now()
        );
        
        log.info("Retrieved booking statistics: {}", stats);
        return ResponseEntity.ok(stats);
    }
}
