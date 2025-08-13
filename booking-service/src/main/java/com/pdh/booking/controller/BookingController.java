package com.pdh.booking.controller;

import com.pdh.booking.model.dto.request.CreateBookingRequestDto;
import com.pdh.booking.model.dto.request.StorefrontCreateBookingRequestDto;
import com.pdh.booking.model.dto.response.BookingResponseDto;
import com.pdh.booking.model.dto.response.StorefrontBookingResponseDto;
import com.pdh.booking.model.dto.response.BookingStatusResponseDto;
import com.pdh.booking.mapper.BookingDtoMapper;
import com.pdh.booking.model.Booking;
import com.pdh.booking.service.BookingService;
import com.pdh.booking.repository.BookingRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * Simplified Booking Controller using direct REST communication
 * Replaces complex saga orchestration with synchronous processing
 */
@RestController
@RequiredArgsConstructor
@Slf4j
public class BookingController {

    private final BookingService bookingService;
    private final BookingDtoMapper bookingDtoMapper;
    private final BookingRepository bookingRepository;
    private final ObjectMapper objectMapper;

    /**
     * Create a new booking using simplified direct REST communication
     */
    @PostMapping("/backoffice")
    public ResponseEntity<BookingResponseDto> createBooking(@Valid @RequestBody CreateBookingRequestDto request) {
        try {
            log.info("Creating booking with type: {}", request.getBookingType());

            // Convert DTO to entity
            Booking booking = bookingDtoMapper.toEntity(request);
            booking.setBookingReference(generateBookingReference());

            // Process booking using simplified service (direct REST calls)
            Booking createdBooking = bookingService.createBooking(booking);

            // Convert entity to response DTO
            BookingResponseDto response = bookingDtoMapper.toResponseDto(createdBooking);

            return ResponseEntity.ok(response);

        } catch (BookingService.BookingProcessingException e) {
            log.error("Error processing booking: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error creating booking", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get booking by saga ID (Backoffice/Admin)
     */
    @GetMapping("/saga/{sagaId}")
    public ResponseEntity<BookingResponseDto> getBookingBySagaId(@PathVariable String sagaId) {
        return bookingService.findBySagaId(sagaId)
                .map(booking -> {
                    BookingResponseDto response = bookingDtoMapper.toResponseDto(booking);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // === STOREFRONT ENDPOINTS ===

    /**
     * Create a new booking using simplified direct REST communication (Storefront)
     */
    @PostMapping("/storefront")
    public ResponseEntity<StorefrontBookingResponseDto> createStorefrontBooking(@Valid @RequestBody StorefrontCreateBookingRequestDto request) {
        try {
            log.info("Creating storefront booking with type: {}", request.getBookingType());

            // Convert DTO to entity
            Booking booking = bookingDtoMapper.toEntity(request);
            booking.setBookingReference(generateBookingReference());

            // Process booking using simplified service (direct REST calls)
            Booking createdBooking = bookingService.createBooking(booking);

            // Convert entity to response DTO
            StorefrontBookingResponseDto response = bookingDtoMapper.toStorefrontResponseDto(createdBooking);

            return ResponseEntity.ok(response);

        } catch (BookingService.BookingProcessingException e) {
            log.error("Error processing storefront booking: {}", e.getMessage());
            StorefrontBookingResponseDto errorResponse = StorefrontBookingResponseDto.builder()
                .error(e.getMessage())
                .errorCode("BOOKING_PROCESSING_ERROR")
                .build();
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            log.error("Error creating storefront booking", e);
            StorefrontBookingResponseDto errorResponse = StorefrontBookingResponseDto.builder()
                .error("An unexpected error occurred")
                .errorCode("INTERNAL_ERROR")
                .build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Get booking by saga ID (Storefront)
     */
    @GetMapping("/storefront/saga/{sagaId}")
    public ResponseEntity<StorefrontBookingResponseDto> getStorefrontBookingBySagaId(@PathVariable String sagaId) {
        return bookingService.findBySagaId(sagaId)
                .map(booking -> {
                    StorefrontBookingResponseDto response = bookingDtoMapper.toStorefrontResponseDto(booking);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private String generateBookingReference() {
        return "BK" + System.currentTimeMillis();
    }

    /**
     * Get booking status for polling (Storefront)
     * Used by frontend to check validation progress
     */
    @GetMapping("/storefront/{bookingId}/status")
    public ResponseEntity<BookingStatusResponseDto> getBookingStatus(@PathVariable UUID bookingId) {
        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);

            if (bookingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Booking booking = bookingOpt.get();

            BookingStatusResponseDto response = BookingStatusResponseDto.builder()
                .bookingId(booking.getBookingId().toString())
                .bookingReference(booking.getBookingReference())
                .status(booking.getStatus())
                .lastUpdated(booking.getUpdatedAt().toString())
                .build();

            // Add status-specific messages
            switch (booking.getStatus()) {
                case VALIDATION_PENDING:
                    response.setMessage("Validating product availability...");
                    response.setEstimatedCompletion("2-5 seconds");
                    break;
                case PENDING:
                    response.setMessage("Processing your booking...");
                    response.setEstimatedCompletion("10-30 seconds");
                    break;
                case CONFIRMED:
                    response.setMessage("Booking confirmed successfully!");
                    break;
                case VALIDATION_FAILED:
                    response.setMessage("Product availability validation failed");
                    break;
                case FAILED:
                    response.setMessage("Booking processing failed");
                    break;
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting booking status for: {}", bookingId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ============== HELPER METHODS FOR ASYNC VALIDATION ==============

    /**
     * Creates validation command payload for async processing
     */
    private String createValidationCommandPayload(Booking booking, Object productDetails) {
        try {
            Map<String, Object> payload = Map.of(
                "bookingId", booking.getBookingId().toString(),
                "bookingType", booking.getBookingType().name(),
                "productDetails", productDetails,
                "totalAmount", booking.getTotalAmount(),
                "customerId", booking.getUserId().toString(),
                "bookingReference", booking.getBookingReference(),
                "timestamp", java.time.Instant.now().toString()
            );

            return objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            log.error("Error creating validation command payload for booking: {}", booking.getBookingId(), e);
            throw new RuntimeException("Failed to create validation command payload", e);
        }
    }

}

