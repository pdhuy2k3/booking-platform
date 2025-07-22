package com.pdh.booking.controller;

import com.pdh.booking.dto.request.CreateBookingRequestDto;
import com.pdh.booking.dto.request.StorefrontCreateBookingRequestDto;
import com.pdh.booking.dto.response.BookingResponseDto;
import com.pdh.booking.dto.response.StorefrontBookingResponseDto;
import com.pdh.booking.mapper.BookingDtoMapper;
import com.pdh.booking.model.Booking;
import com.pdh.booking.service.BookingSagaService;
import com.pdh.common.dto.ApiResponse;
import com.pdh.common.util.ResponseUtils;
import com.pdh.common.constants.ErrorCodes;

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

    /**
     * Create a new booking and start saga (Backoffice/Admin)
     */
    @PostMapping("/backoffice")
    public ResponseEntity<ApiResponse<BookingResponseDto>> createBooking(@Valid @RequestBody CreateBookingRequestDto request) {
        try {
            log.info("Creating booking with type: {}", request.getBookingType());

            // Convert DTO to entity
            Booking booking = bookingDtoMapper.toEntity(request);
            booking.setBookingReference(generateBookingReference());

            // Start saga
            Booking createdBooking = bookingSagaService.startBookingSaga(booking);

            // Convert entity to response DTO
            BookingResponseDto response = bookingDtoMapper.toResponseDto(createdBooking);

            return ResponseUtils.created(response, "Booking created successfully and saga started");

        } catch (IllegalArgumentException e) {
            log.error("Invalid booking request", e);
            return ResponseUtils.badRequest(e.getMessage(), ErrorCodes.INVALID_BOOKING_STATUS);
        } catch (Exception e) {
            log.error("Error creating booking", e);
            return ResponseUtils.internalError("Failed to create booking");
        }
    }

    /**
     * Get booking by saga ID (Backoffice/Admin)
     */
    @GetMapping("/saga/{sagaId}")
    public ResponseEntity<ApiResponse<BookingResponseDto>> getBookingBySagaId(@PathVariable String sagaId) {
        try {
            return bookingSagaService.findBySagaId(sagaId)
                    .map(booking -> {
                        BookingResponseDto response = bookingDtoMapper.toResponseDto(booking);
                        return ResponseUtils.ok(response, "Booking retrieved successfully");
                    })
                    .orElse(ResponseUtils.notFound("Booking not found with saga ID: " + sagaId));
        } catch (Exception e) {
            log.error("Error retrieving booking by saga ID: {}", sagaId, e);
            return ResponseUtils.internalError("Failed to retrieve booking");
        }
    }

    // === STOREFRONT ENDPOINTS ===

    /**
     * Create a new booking and start saga (Storefront)
     * Frontend calls: POST /api/bookings/storefront
     * BFF routes to: POST /bookings/storefront
     */
    @PostMapping("/storefront")
    public ResponseEntity<ApiResponse<StorefrontBookingResponseDto>> createStorefrontBooking(@Valid @RequestBody StorefrontCreateBookingRequestDto request) {
        try {
            log.info("Creating storefront booking with type: {}", request.getBookingType());

            // Convert DTO to entity
            Booking booking = bookingDtoMapper.toEntity(request);
            booking.setBookingReference(generateBookingReference());

            // Start saga
            Booking createdBooking = bookingSagaService.startBookingSaga(booking);

            // Convert entity to response DTO
            StorefrontBookingResponseDto response = bookingDtoMapper.toStorefrontResponseDto(createdBooking);

            return ResponseUtils.created(response, "Booking created successfully and processing started");

        } catch (IllegalArgumentException e) {
            log.error("Invalid storefront booking request", e);
            return ResponseUtils.badRequest(e.getMessage(), ErrorCodes.INVALID_BOOKING_STATUS);
        } catch (Exception e) {
            log.error("Error creating storefront booking", e);
            return ResponseUtils.internalError("Failed to create booking");
        }
    }

    /**
     * Get booking by saga ID (Storefront)
     * Frontend calls: GET /api/bookings/storefront/saga/{sagaId}
     * BFF routes to: GET /bookings/storefront/saga/{sagaId}
     */
    @GetMapping("/storefront/saga/{sagaId}")
    public ResponseEntity<ApiResponse<StorefrontBookingResponseDto>> getStorefrontBookingBySagaId(@PathVariable String sagaId) {
        try {
            return bookingSagaService.findBySagaId(sagaId)
                    .map(booking -> {
                        StorefrontBookingResponseDto response = bookingDtoMapper.toStorefrontResponseDto(booking);
                        return ResponseUtils.ok(response, "Booking retrieved successfully");
                    })
                    .orElse(ResponseUtils.notFound("Booking not found with saga ID: " + sagaId));
        } catch (Exception e) {
            log.error("Error retrieving storefront booking by saga ID: {}", sagaId, e);
            return ResponseUtils.internalError("Failed to retrieve booking");
        }
    }

    private String generateBookingReference() {
        return "BK" + System.currentTimeMillis();
    }

}