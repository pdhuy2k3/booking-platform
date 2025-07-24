package com.pdh.booking.controller;

import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.model.enums.BookingType;
import com.pdh.booking.service.BackofficeBookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Backoffice Booking Controller
 * Provides advanced booking management capabilities with JSONB querying
 * for flight and hotel booking details
 */
@RestController
@RequestMapping("/backoffice/bookings")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN') or hasRole('BACKOFFICE_USER')")
public class BackofficeBookingController {

    private final BackofficeBookingService backofficeBookingService;

    /**
     * Get all bookings with pagination and filtering
     */
    @GetMapping
    public ResponseEntity<Page<Booking>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) BookingType bookingType,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("Fetching bookings - page: {}, size: {}, type: {}, status: {}, startDate: {}, endDate: {}", 
                page, size, bookingType, status, startDate, endDate);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookings = backofficeBookingService.getAllBookings(
                pageable, bookingType, status, startDate, endDate);
        
        return ResponseEntity.ok(bookings);
    }

    /**
     * Search flight bookings by airline
     */
    @GetMapping("/flights/by-airline")
    public ResponseEntity<Page<Booking>> getFlightBookingsByAirline(
            @RequestParam String airline,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Searching flight bookings by airline: {}", airline);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookings = backofficeBookingService.getFlightBookingsByAirline(airline, pageable);
        
        return ResponseEntity.ok(bookings);
    }

    /**
     * Search flight bookings by route (departure and arrival airports)
     */
    @GetMapping("/flights/by-route")
    public ResponseEntity<Page<Booking>> getFlightBookingsByRoute(
            @RequestParam String departureAirport,
            @RequestParam String arrivalAirport,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Searching flight bookings by route: {} -> {}", departureAirport, arrivalAirport);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookings = backofficeBookingService.getFlightBookingsByRoute(
                departureAirport, arrivalAirport, pageable);
        
        return ResponseEntity.ok(bookings);
    }

    /**
     * Search flight bookings by departure date range
     */
    @GetMapping("/flights/by-departure-date")
    public ResponseEntity<Page<Booking>> getFlightBookingsByDepartureDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Searching flight bookings by departure date: {} to {}", startDate, endDate);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookings = backofficeBookingService.getFlightBookingsByDepartureDate(
                startDate, endDate, pageable);
        
        return ResponseEntity.ok(bookings);
    }

    /**
     * Search hotel bookings by hotel name
     */
    @GetMapping("/hotels/by-hotel-name")
    public ResponseEntity<Page<Booking>> getHotelBookingsByHotelName(
            @RequestParam String hotelName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Searching hotel bookings by hotel name: {}", hotelName);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookings = backofficeBookingService.getHotelBookingsByHotelName(hotelName, pageable);
        
        return ResponseEntity.ok(bookings);
    }

    /**
     * Search hotel bookings by location (city)
     */
    @GetMapping("/hotels/by-location")
    public ResponseEntity<Page<Booking>> getHotelBookingsByLocation(
            @RequestParam String city,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Searching hotel bookings by location: {}", city);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookings = backofficeBookingService.getHotelBookingsByLocation(city, pageable);
        
        return ResponseEntity.ok(bookings);
    }

    /**
     * Search hotel bookings by check-in date range
     */
    @GetMapping("/hotels/by-checkin-date")
    public ResponseEntity<Page<Booking>> getHotelBookingsByCheckInDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Searching hotel bookings by check-in date: {} to {}", startDate, endDate);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookings = backofficeBookingService.getHotelBookingsByCheckInDate(
                startDate, endDate, pageable);
        
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get booking statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getBookingStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("Fetching booking statistics for period: {} to {}", startDate, endDate);
        
        Map<String, Object> statistics = backofficeBookingService.getBookingStatistics(startDate, endDate);
        
        return ResponseEntity.ok(statistics);
    }

    /**
     * Get booking by ID with full details
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<Booking> getBookingById(@PathVariable UUID bookingId) {
        log.info("Fetching booking details for ID: {}", bookingId);
        
        Booking booking = backofficeBookingService.getBookingById(bookingId);
        
        return ResponseEntity.ok(booking);
    }

    /**
     * Search bookings by customer ID
     */
    @GetMapping("/by-customer/{customerId}")
    public ResponseEntity<Page<Booking>> getBookingsByCustomerId(
            @PathVariable UUID customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Fetching bookings for customer: {}", customerId);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookings = backofficeBookingService.getBookingsByCustomerId(customerId, pageable);
        
        return ResponseEntity.ok(bookings);
    }

    /**
     * Advanced search with multiple JSONB criteria
     */
    @PostMapping("/advanced-search")
    public ResponseEntity<Page<Booking>> advancedSearch(
            @RequestBody Map<String, Object> searchCriteria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Performing advanced search with criteria: {}", searchCriteria);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookings = backofficeBookingService.advancedSearch(searchCriteria, pageable);
        
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get popular destinations (for flights and hotels)
     */
    @GetMapping("/popular-destinations")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getPopularDestinations(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("Fetching popular destinations for period: {} to {}", startDate, endDate);
        
        Map<String, List<Map<String, Object>>> destinations = backofficeBookingService
                .getPopularDestinations(startDate, endDate);
        
        return ResponseEntity.ok(destinations);
    }

    /**
     * Get revenue analytics
     */
    @GetMapping("/revenue-analytics")
    public ResponseEntity<Map<String, Object>> getRevenueAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String groupBy) {
        
        log.info("Fetching revenue analytics for period: {} to {}, grouped by: {}", 
                startDate, endDate, groupBy);
        
        Map<String, Object> analytics = backofficeBookingService.getRevenueAnalytics(
                startDate, endDate, groupBy);
        
        return ResponseEntity.ok(analytics);
    }
}
