package com.pdh.booking.controller;

import com.pdh.booking.dto.request.CreateBookingRequestDto;
import com.pdh.booking.dto.request.StorefrontCreateBookingRequestDto;
import com.pdh.booking.dto.response.BookingResponseDto;
import com.pdh.booking.dto.response.StorefrontBookingResponseDto;
import com.pdh.booking.mapper.BookingDtoMapper;
import com.pdh.booking.model.Booking;
import com.pdh.booking.service.BookingSagaService;
import com.pdh.common.utils.AuthenticationUtils;

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
            log.info("Creating storefront booking with type: {}", request.getBookingType());
            // Convert DTO to entity
            Booking booking = bookingDtoMapper.toEntity(request);
            booking.setBookingReference(generateBookingReference());

            // Start saga
            Booking createdBooking = bookingSagaService.startBookingSaga(booking);

            // Convert entity to response DTO
            StorefrontBookingResponseDto response = bookingDtoMapper.toStorefrontResponseDto(createdBooking);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error creating storefront booking", e);
            return ResponseEntity.internalServerError().build();
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

}