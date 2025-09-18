package com.pdh.booking.controller;

import com.pdh.booking.command.CreateBookingCommand;
import com.pdh.booking.model.dto.request.CreateBookingRequestDto;
import com.pdh.booking.model.dto.request.StorefrontCreateBookingRequestDto;
import com.pdh.booking.model.dto.response.BookingResponseDto;
import com.pdh.booking.model.dto.response.StorefrontBookingResponseDto;
import com.pdh.booking.model.dto.response.BookingStatusResponseDto;
import com.pdh.booking.mapper.BookingDtoMapper;
import com.pdh.booking.model.Booking;
import com.pdh.booking.service.BookingCqrsService;
import com.pdh.common.config.OpenApiResponses;
import com.pdh.common.utils.AuthenticationUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * CQRS-based Booking Controller
 * 
 * Handles all booking-related operations using Command Query Responsibility Segregation (CQRS).
 * Uses saga orchestration for booking creation and direct queries for data retrieval.
 * REST calls are only used for backoffice management purposes.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Bookings", description = "Booking management and orchestration operations")
@SecurityRequirement(name = "oauth2")
public class BookingController {

    private final BookingCqrsService bookingCqrsService;
    private final BookingDtoMapper bookingDtoMapper;
    private final ObjectMapper objectMapper;

    /**
     * Create a new booking using CQRS and saga orchestration
     */
    @Operation(
        summary = "Create booking (Admin)",
        description = "Create a new booking using saga orchestration for reliable distributed transaction processing",
        tags = {"Admin API", "Booking Creation"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"admin"})
    @OpenApiResponses.CreationApiResponses
    @PostMapping("/backoffice")
    public ResponseEntity<BookingResponseDto> createBooking(
            @Parameter(description = "Booking creation request", required = true)
            @Valid @RequestBody CreateBookingRequestDto request) {
        try {
            log.info("Creating booking with type: {} using CQRS", request.getBookingType());

            // Convert DTO to command
            CreateBookingCommand command = CreateBookingCommand.builder()
                    .userId(AuthenticationUtils.getCurrentUserIdFromContext())
                    .bookingType(request.getBookingType())
                    .totalAmount(request.getTotalAmount())
                    .currency(request.getCurrency())
                    .productDetailsJson(objectMapper.writeValueAsString(request.getProductDetails()))
                    .notes(request.getNotes())
                    .bookingSource("ADMIN")
                    .sagaId(UUID.randomUUID().toString())
                    .correlationId(UUID.randomUUID().toString())
                    .build();

            // Execute command via CQRS service
            Booking createdBooking = bookingCqrsService.createBooking(command);

            // Convert entity to response DTO
            BookingResponseDto response = bookingDtoMapper.toResponseDto(createdBooking);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error creating booking via CQRS: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get booking by saga ID (Backoffice/Admin)
     */
    @Operation(
        summary = "Get booking by saga ID",
        description = "Retrieve booking details using the saga ID for administrative purposes",
        tags = {"Admin API"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"admin"})
    @OpenApiResponses.StandardApiResponsesWithNotFound
    @GetMapping("/saga/{sagaId}")
    public ResponseEntity<BookingResponseDto> getBookingBySagaId(
            @Parameter(description = "Saga ID", required = true, example = "saga-12345")
            @PathVariable String sagaId) {
        try {
            String userId = AuthenticationUtils.extractUserId();
            Optional<Booking> booking = bookingCqrsService.getBookingBySagaId(sagaId, userId);
            
            return booking.map(b -> {
                BookingResponseDto response = bookingDtoMapper.toResponseDto(b);
                return ResponseEntity.ok(response);
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting booking by saga ID: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // === STOREFRONT ENDPOINTS ===

    /**
     * Create a new booking using CQRS and saga orchestration (Storefront)
     */
    @Operation(
        summary = "Create booking (Customer)",
        description = "Create a new booking from the customer storefront using saga orchestration",
        tags = {"Public API", "Booking Creation"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"customer"})
    @OpenApiResponses.CreationApiResponses
    @PostMapping("/storefront")
    public ResponseEntity<StorefrontBookingResponseDto> createStorefrontBooking(
            @Parameter(description = "Storefront booking creation request", required = true)
            @Valid @RequestBody StorefrontCreateBookingRequestDto request) {
        try {
            log.info("Creating storefront booking with type: {} ", request.getBookingType());

            CreateBookingCommand command = CreateBookingCommand.builder()
                    .userId(AuthenticationUtils.getCurrentUserIdFromContext())
                    .bookingType(request.getBookingType())
                    .totalAmount(BigDecimal.valueOf(request.getTotalAmount()))
                    .currency(request.getCurrency())
                    .productDetailsJson(objectMapper.writeValueAsString(request.getProductDetails()))
                    .notes(request.getNotes())
                    .bookingSource("STOREFRONT")
                    .sagaId(UUID.randomUUID().toString())
                    .correlationId(UUID.randomUUID().toString())
                    .build();

            // Execute command via CQRS service
            Booking createdBooking = bookingCqrsService.createBooking(command);

            // Convert entity to response DTO
            StorefrontBookingResponseDto response = bookingDtoMapper.toStorefrontResponseDto(createdBooking);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error creating storefront booking via CQRS: {}", e.getMessage(), e);
            StorefrontBookingResponseDto errorResponse = StorefrontBookingResponseDto.builder()
                .error("An unexpected error occurred: " + e.getMessage())
                .errorCode("BOOKING_CREATION_ERROR")
                .build();
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Get booking by saga ID (Storefront) using CQRS
     */
    @Operation(
        summary = "Get booking by saga ID (Customer)",
        description = "Retrieve booking details using the saga ID for customer storefront",
        tags = {"Public API"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"customer"})
    @OpenApiResponses.StandardApiResponsesWithNotFound
    @GetMapping("/storefront/saga/{sagaId}")
    public ResponseEntity<StorefrontBookingResponseDto> getStorefrontBookingBySagaId(
            @Parameter(description = "Saga ID", required = true, example = "saga-12345")
            @PathVariable String sagaId) {
        try {
            UUID userId = AuthenticationUtils.getCurrentUserIdFromContext();
            Optional<Booking> booking = bookingCqrsService.getBookingBySagaId(sagaId, userId.toString());
            
            return booking.map(b -> {
                StorefrontBookingResponseDto response = bookingDtoMapper.toStorefrontResponseDto(b);
                return ResponseEntity.ok(response);
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting booking by saga ID: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }


    /**
     * Get booking status for polling (Storefront) using CQRS
     * Used by frontend to check validation progress
     */
    @Operation(
        summary = "Get booking status",
        description = "Poll booking status to track validation and processing progress",
        tags = {"Public API", "Status Tracking"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"customer"})
    @OpenApiResponses.StandardApiResponsesWithNotFound
    @GetMapping("/storefront/{bookingId}/status")
    public ResponseEntity<BookingStatusResponseDto> getBookingStatus(
            @Parameter(description = "Booking ID", required = true, example = "123e4567-e89b-12d3-a456-426614174000")
            @PathVariable UUID bookingId) {
        try {
            UUID userId = AuthenticationUtils.getCurrentUserIdFromContext();
            Optional<Booking> bookingOpt = bookingCqrsService.getBookingById(bookingId, userId);

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
                case PAYMENT_PENDING:
                    response.setMessage("Waiting for payment processing...");
                    response.setEstimatedCompletion("5-15 seconds");
                    break;
                case PAID:
                    response.setMessage("Payment completed successfully!");
                    break;
                case PAYMENT_FAILED:
                    response.setMessage("Payment processing failed");
                    break;
                case CANCELLED:
                    response.setMessage("Booking has been cancelled");
                    break;
                case VALIDATION_FAILED:
                    response.setMessage("Product availability validation failed");
                    break;
                case FAILED:
                    response.setMessage("Booking processing failed");
                    break;
                default:
                    response.setMessage("Unknown status");
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

}

