package com.pdh.booking.controller;

import com.pdh.booking.model.Booking;
import com.pdh.booking.model.dto.response.BookingResponseDto;
import com.pdh.booking.model.dto.response.StorefrontBookingResponseDto;
import com.pdh.booking.mapper.BookingDtoMapper;
import com.pdh.booking.query.GetUserBookingsQuery;
import com.pdh.booking.service.BookingCqrsService;
import com.pdh.common.config.OpenApiResponses;
import com.pdh.common.utils.AuthenticationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Booking Query Controller
 * Handles all booking read operations using CQRS pattern
 * Separated from commands to maintain clear separation of concerns
 */
@RestController
@RequestMapping("/queries")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Booking Queries", description = "Booking query operations (read-only)")
@SecurityRequirement(name = "oauth2")
public class BookingQueryController {

    private final BookingCqrsService bookingCqrsService;
    private final BookingDtoMapper bookingDtoMapper;

    /**
     * Get booking by ID
     */
    @Operation(
        summary = "Get booking by ID",
        description = "Retrieve booking details by booking ID",
        tags = {"Booking Queries"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"customer", "admin"})
    @OpenApiResponses.StandardApiResponsesWithNotFound
    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponseDto> getBookingById(
            @Parameter(description = "Booking ID", required = true)
            @PathVariable UUID bookingId) {
        try {
            UUID userId = AuthenticationUtils.getCurrentUserIdFromContext();
            var booking = bookingCqrsService.getBookingById(bookingId, userId);
            
            return booking.map(b -> {
                BookingResponseDto response = bookingDtoMapper.toResponseDto(b);
                return ResponseEntity.ok(response);
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting booking by ID: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get booking by saga ID
     */
    @Operation(
        summary = "Get booking by saga ID",
        description = "Retrieve booking details by saga ID for tracking",
        tags = {"Booking Queries", "Saga Tracking"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"customer", "admin"})
    @OpenApiResponses.StandardApiResponsesWithNotFound
    @GetMapping("/saga/{sagaId}")
    public ResponseEntity<BookingResponseDto> getBookingBySagaId(
            @Parameter(description = "Saga ID", required = true)
            @PathVariable String sagaId) {
        try {
            UUID userId = AuthenticationUtils.getCurrentUserIdFromContext();
            var booking = bookingCqrsService.getBookingBySagaId(sagaId, userId.toString());
            
            return booking.map(b -> {
                BookingResponseDto response = bookingDtoMapper.toResponseDto(b);
                return ResponseEntity.ok(response);
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting booking by saga ID: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get user's bookings with filtering and pagination
     */
    @Operation(
        summary = "Get user bookings",
        description = "Retrieve user's bookings with optional filtering and pagination",
        tags = {"Booking Queries", "User Bookings"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"customer", "admin"})
    @OpenApiResponses.PaginatedApiResponses
    @GetMapping("/user")
    public ResponseEntity<Page<BookingResponseDto>> getUserBookings(
            @Parameter(description = "Booking type filter")
            @RequestParam(required = false) String bookingType,
            @Parameter(description = "Status filter")
            @RequestParam(required = false) String status,
            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") int size) {
        try {
            UUID userId = AuthenticationUtils.getCurrentUserIdFromContext();
            
            GetUserBookingsQuery query = GetUserBookingsQuery.builder()
                    .userId(userId)
                    .bookingType(bookingType != null ? com.pdh.booking.model.enums.BookingType.valueOf(bookingType) : null)
                    .status(status != null ? com.pdh.booking.model.enums.BookingStatus.valueOf(status) : null)
                    .page(page)
                    .size(size)
                    .build();
            
            Page<Booking> bookings = bookingCqrsService.getUserBookings(query);
            Page<BookingResponseDto> response = bookings.map(bookingDtoMapper::toResponseDto);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting user bookings: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get storefront booking by ID (simplified response)
     */
    @Operation(
        summary = "Get storefront booking by ID",
        description = "Retrieve booking details for storefront with simplified response",
        tags = {"Booking Queries", "Storefront"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"customer"})
    @OpenApiResponses.StandardApiResponsesWithNotFound
    @GetMapping("/storefront/{bookingId}")
    public ResponseEntity<StorefrontBookingResponseDto> getStorefrontBookingById(
            @Parameter(description = "Booking ID", required = true)
            @PathVariable UUID bookingId) {
        try {
            UUID userId = AuthenticationUtils.getCurrentUserIdFromContext();
            var booking = bookingCqrsService.getBookingById(bookingId, userId);
            
            return booking.map(b -> {
                StorefrontBookingResponseDto response = bookingDtoMapper.toStorefrontResponseDto(b);
                return ResponseEntity.ok(response);
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting storefront booking by ID: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get storefront booking by saga ID (simplified response)
     */
    @Operation(
        summary = "Get storefront booking by saga ID",
        description = "Retrieve booking details by saga ID for storefront with simplified response",
        tags = {"Booking Queries", "Storefront", "Saga Tracking"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"customer"})
    @OpenApiResponses.StandardApiResponsesWithNotFound
    @GetMapping("/storefront/saga/{sagaId}")
    public ResponseEntity<StorefrontBookingResponseDto> getStorefrontBookingBySagaId(
            @Parameter(description = "Saga ID", required = true)
            @PathVariable String sagaId) {
        try {
            UUID userId = AuthenticationUtils.getCurrentUserIdFromContext();
            var booking = bookingCqrsService.getBookingBySagaId(sagaId, userId.toString());
            
            return booking.map(b -> {
                StorefrontBookingResponseDto response = bookingDtoMapper.toStorefrontResponseDto(b);
                return ResponseEntity.ok(response);
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting storefront booking by saga ID: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
