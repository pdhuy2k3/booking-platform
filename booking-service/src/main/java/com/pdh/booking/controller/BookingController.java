package com.pdh.booking.controller;

import com.pdh.booking.model.Booking;
import com.pdh.booking.service.BookingSagaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bookings") // Remove /api/v1 prefix as it's handled by gateway
@RequiredArgsConstructor
@Slf4j
public class BookingController {

    private final BookingSagaService bookingSagaService;

    /**
     * Create a new booking and start saga
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@RequestBody CreateBookingRequest request) {
        try {
            log.info("Creating booking with type: {}", request.getBookingType());

            // Create booking entity
            Booking booking = new Booking();
            booking.setBookingReference(generateBookingReference());
            booking.setUserId(request.getUserId());
            booking.setTotalAmount(request.getTotalAmount());
            booking.setCurrency(request.getCurrency());
            booking.setBookingType(request.getBookingType());

            // Start saga
            Booking createdBooking = bookingSagaService.startBookingSaga(booking);

            BookingResponse response = BookingResponse.builder()
                    .bookingId(createdBooking.getBookingId())
                    .bookingReference(createdBooking.getBookingReference())
                    .sagaId(createdBooking.getSagaId())
                    .status(createdBooking.getStatus())
                    .sagaState(createdBooking.getSagaState())
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error creating booking", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get booking by saga ID
     */
    @GetMapping("/saga/{sagaId}")
    public ResponseEntity<BookingResponse> getBookingBySagaId(@PathVariable String sagaId) {
        return bookingSagaService.findBySagaId(sagaId)
                .map(booking -> {
                    BookingResponse response = BookingResponse.builder()
                            .bookingId(booking.getBookingId())
                            .bookingReference(booking.getBookingReference())
                            .sagaId(booking.getSagaId())
                            .status(booking.getStatus())
                            .sagaState(booking.getSagaState())
                            .confirmationNumber(booking.getConfirmationNumber())
                            .build();
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private String generateBookingReference() {
        return "BK" + System.currentTimeMillis();
    }

    // DTOs
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class CreateBookingRequest {
        private java.util.UUID userId;
        private com.pdh.booking.model.enums.BookingType bookingType;
        private java.math.BigDecimal totalAmount;
        private String currency = "VND";
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class BookingResponse {
        private java.util.UUID bookingId;
        private String bookingReference;
        private String sagaId;
        private com.pdh.booking.model.enums.BookingStatus status;
        private com.pdh.common.saga.SagaState sagaState;
        private String confirmationNumber;
    }

    // ... existing code ...
}