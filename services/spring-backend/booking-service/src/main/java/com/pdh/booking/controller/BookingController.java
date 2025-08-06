package com.pdh.booking.controller;

import com.pdh.booking.dto.request.CreateBookingRequestDto;
import com.pdh.booking.dto.request.StorefrontCreateBookingRequestDto;
import com.pdh.booking.dto.response.BookingResponseDto;
import com.pdh.booking.dto.response.StorefrontBookingResponseDto;
import com.pdh.booking.dto.response.BookingStatusResponseDto;
import com.pdh.booking.mapper.BookingDtoMapper;
import com.pdh.booking.model.Booking;
import com.pdh.booking.service.BookingSagaService;
import com.pdh.booking.repository.BookingRepository;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.common.utils.AuthenticationUtils;
import com.pdh.common.outbox.service.OutboxEventService;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequiredArgsConstructor
@Slf4j
public class BookingController {

    private final BookingSagaService bookingSagaService;
    private final BookingDtoMapper bookingDtoMapper;
    private final OutboxEventService eventPublisher;
    private final BookingRepository bookingRepository;
    private final ObjectMapper objectMapper;

    /**
     * Create a new booking and start saga (Backoffice/Admin)
     */
    @PostMapping("/backoffice")
    public ResponseEntity<BookingResponseDto> createBooking(@Valid @RequestBody CreateBookingRequestDto request) {
        try {
            log.info("Creating booking with type: {}", request.getBookingType());

            // Convert DTO to entity
            Booking booking = bookingDtoMapper.toEntity(request);
            booking.setBookingReference(generateBookingReference());

            // Start saga
            Booking createdBooking = bookingSagaService.startBookingSaga(booking);

            // Convert entity to response DTO
            BookingResponseDto response = bookingDtoMapper.toResponseDto(createdBooking);

            return ResponseEntity.ok(response);

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
        return bookingSagaService.findBySagaId(sagaId)
                .map(booking -> {
                    BookingResponseDto response = bookingDtoMapper.toResponseDto(booking);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // === STOREFRONT ENDPOINTS ===

    /**
     * Create a new booking and start saga (Storefront)
     */
    @PostMapping("/storefront")
    public ResponseEntity<StorefrontBookingResponseDto> createStorefrontBooking(@Valid @RequestBody StorefrontCreateBookingRequestDto request) {
        try {
            log.info("Creating storefront booking with type: {} (async validation)", request.getBookingType());

            // 1. Create booking immediately with VALIDATION_PENDING status (Listen to Yourself ✅)
            Booking booking = bookingDtoMapper.toEntity(request);
            booking.setBookingReference(generateBookingReference());
            booking.setStatus(BookingStatus.VALIDATION_PENDING); // Set validation pending status

            // Save booking to database immediately
            Booking savedBooking = bookingRepository.save(booking);
            log.info("Booking created with ID: {} and reference: {}, status: VALIDATION_PENDING",
                savedBooking.getBookingId(), savedBooking.getBookingReference());

            // 2. Write validation command to own outbox (Listen to Yourself ✅)
            String validationCommandPayload = createValidationCommandPayload(savedBooking, request.getProductDetails());
            eventPublisher.publishEvent(
                "ValidateInventoryCommand",
                "Booking",
                savedBooking.getBookingId().toString(),
                validationCommandPayload
            );

            log.info("Validation command published for booking: {}", savedBooking.getBookingId());

            // 3. Return immediately with VALIDATION_PENDING status (202 Accepted)
            StorefrontBookingResponseDto response = bookingDtoMapper.toStorefrontResponseDto(savedBooking);
            response.setValidationDetails(Map.of(
                "message", "Booking created successfully. Inventory validation in progress.",
                "estimatedValidationTime", "2-5 seconds"
            ));

            return ResponseEntity.accepted().body(response); // 202 Accepted - processing async

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
        return bookingSagaService.findBySagaId(sagaId)
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