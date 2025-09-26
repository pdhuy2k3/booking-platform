package com.pdh.booking.service;

import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.model.enums.BookingType;
import com.pdh.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.*;

/**
 * Service for backoffice booking management with JSONB querying capabilities
 * Provides advanced search and analytics features for booking data
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BackofficeBookingService {

    private final BookingRepository bookingRepository;

    /**
     * Get all bookings with filtering
     */
    @Transactional(readOnly = true)
    public Page<Booking> getAllBookings(Pageable pageable, BookingType bookingType,
                                       BookingStatus status, LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching bookings with filters - type: {}, status: {}, dates: {} to {}",
                bookingType, status, startDate, endDate);
        if(bookingType == null && status == null && startDate == null && endDate == null) {
            return bookingRepository.findAll(pageable);
        }
        if(bookingType != null && status == null && startDate == null && endDate == null) {
            return bookingRepository.findByBookingType(bookingType, pageable);
        }
        if(status != null && bookingType == null && startDate == null && endDate == null) {
            return bookingRepository.findByStatus(status, pageable);
        }
        
        return bookingRepository.findBookingsWithFilters(
                bookingType, status, startDate, endDate, pageable);
    }

    /**
     * Search flight bookings by airline using JSONB query
     */
    @Transactional(readOnly = true)
    public Page<Booking> getFlightBookingsByAirline(String airline, Pageable pageable) {
        log.debug("Searching flight bookings by airline: {}", airline);

        return bookingRepository.findFlightBookingsByAirline(airline, pageable);
    }

    /**
     * Search flight bookings by route using JSONB query
     */
    @Transactional(readOnly = true)
    public Page<Booking> getFlightBookingsByRoute(String departureAirport, String arrivalAirport, Pageable pageable) {
        log.debug("Searching flight bookings by route: {} -> {}", departureAirport, arrivalAirport);

        return bookingRepository.findFlightBookingsByRoute(
                departureAirport, arrivalAirport, pageable);
    }

    /**
     * Search flight bookings by departure date range using JSONB query
     */
    @Transactional(readOnly = true)
    public Page<Booking> getFlightBookingsByDepartureDate(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        log.debug("Searching flight bookings by departure date: {} to {}", startDate, endDate);

        return bookingRepository.findFlightBookingsByDepartureDate(
                startDate, endDate, pageable);
    }

    /**
     * Search hotel bookings by hotel name using JSONB query
     */
    @Transactional(readOnly = true)
    public Page<Booking> getHotelBookingsByHotelName(String hotelName, Pageable pageable) {
        log.debug("Searching hotel bookings by hotel name: {}", hotelName);

        return bookingRepository.findHotelBookingsByHotelName(hotelName, pageable);
    }

    /**
     * Search hotel bookings by location using JSONB query
     */
    @Transactional(readOnly = true)
    public Page<Booking> getHotelBookingsByLocation(String city, Pageable pageable) {
        log.debug("Searching hotel bookings by location: {}", city);

        return bookingRepository.findHotelBookingsByLocation(city, pageable);
    }

    /**
     * Search hotel bookings by check-in date range using JSONB query
     */
    @Transactional(readOnly = true)
    public Page<Booking> getHotelBookingsByCheckInDate(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        log.debug("Searching hotel bookings by check-in date: {} to {}", startDate, endDate);

        return bookingRepository.findHotelBookingsByCheckInDate(
                startDate, endDate, pageable);
    }

    /**
     * Get booking statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getBookingStatistics(LocalDate startDate, LocalDate endDate) {
        log.debug("Calculating booking statistics for period: {} to {}", startDate, endDate);
        
        Map<String, Object> statistics = new HashMap<>();
        
        // Total bookings
        Long totalBookings = bookingRepository.countBookingsInPeriod(startDate, endDate);
        statistics.put("totalBookings", totalBookings);

        // Bookings by type
        Map<String, Long> bookingsByType = new HashMap<>();
        for (BookingType type : BookingType.values()) {
            Long count = bookingRepository.countBookingsByTypeInPeriod(type, startDate, endDate);
            bookingsByType.put(type.name(), count);
        }
        statistics.put("bookingsByType", bookingsByType);

        // Bookings by status
        Map<String, Long> bookingsByStatus = new HashMap<>();
        for (BookingStatus status : BookingStatus.values()) {
            Long count = bookingRepository.countBookingsByStatusInPeriod(status, startDate, endDate);
            bookingsByStatus.put(status.name(), count);
        }
        statistics.put("bookingsByStatus", bookingsByStatus);

        // Revenue statistics
        Double totalRevenue = bookingRepository.getTotalRevenueInPeriod(startDate, endDate);
        statistics.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);

        Double averageBookingValue = bookingRepository.getAverageBookingValueInPeriod(startDate, endDate);
        statistics.put("averageBookingValue", averageBookingValue != null ? averageBookingValue : 0.0);
        
        return statistics;
    }

    /**
     * Get booking by ID
     */
    @Transactional(readOnly = true)
    public Booking getBookingById(UUID bookingId) {
        log.debug("Fetching booking by ID: {}", bookingId);

        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
    }

    /**
     * Get bookings by customer ID
     */
    @Transactional(readOnly = true)
    public Page<Booking> getBookingsByCustomerId(UUID customerId, Pageable pageable) {
        log.debug("Fetching bookings for customer: {}", customerId);

        return bookingRepository.findByUserIdOrderByCreatedAtDesc(customerId, pageable);
    }

    /**
     * Advanced search with multiple JSONB criteria
     */
    @Transactional(readOnly = true)
    public Page<Booking> advancedSearch(Map<String, Object> searchCriteria, Pageable pageable) {
        log.debug("Performing advanced search with criteria: {}", searchCriteria);

        // For now, return basic search - can be enhanced with dynamic query building
        return bookingRepository.findAll(pageable);
    }

    /**
     * Get popular destinations
     */
    @Transactional(readOnly = true)
    public Map<String, List<Map<String, Object>>> getPopularDestinations(LocalDate startDate, LocalDate endDate) {
        log.debug("Fetching popular destinations for period: {} to {}", startDate, endDate);
        
        Map<String, List<Map<String, Object>>> destinations = new HashMap<>();
        
        // Popular flight destinations
        List<Map<String, Object>> flightDestinations = bookingRepository
                .getPopularFlightDestinations(startDate, endDate);
        destinations.put("flights", flightDestinations);

        // Popular hotel destinations
        List<Map<String, Object>> hotelDestinations = bookingRepository
                .getPopularHotelDestinations(startDate, endDate);
        destinations.put("hotels", hotelDestinations);
        
        return destinations;
    }

    /**
     * Get revenue analytics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getRevenueAnalytics(LocalDate startDate, LocalDate endDate, String groupBy) {
        log.debug("Fetching revenue analytics for period: {} to {}, grouped by: {}", 
                startDate, endDate, groupBy);
        
        Map<String, Object> analytics = new HashMap<>();
        
        if ("day".equalsIgnoreCase(groupBy)) {
            List<Map<String, Object>> dailyRevenue = bookingRepository
                    .getDailyRevenue(startDate, endDate);
            analytics.put("dailyRevenue", dailyRevenue);
        } else if ("month".equalsIgnoreCase(groupBy)) {
            List<Map<String, Object>> monthlyRevenue = bookingRepository
                    .getMonthlyRevenue(startDate, endDate);
            analytics.put("monthlyRevenue", monthlyRevenue);
        } else if ("type".equalsIgnoreCase(groupBy)) {
            List<Map<String, Object>> revenueByType = bookingRepository
                    .getRevenueByBookingType(startDate, endDate);
            analytics.put("revenueByType", revenueByType);
        }

        // Overall metrics
        Double totalRevenue = bookingRepository.getTotalRevenueInPeriod(startDate, endDate);
        analytics.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);

        Long totalBookings = bookingRepository.countBookingsInPeriod(startDate, endDate);
        analytics.put("totalBookings", totalBookings);
        
        if (totalBookings > 0 && totalRevenue != null) {
            analytics.put("averageBookingValue", totalRevenue / totalBookings);
        } else {
            analytics.put("averageBookingValue", 0.0);
        }
        
        return analytics;
    }

    /**
     * Update booking status (Admin operation)
     */
    @Transactional
    public Booking updateBookingStatus(UUID bookingId, BookingStatus newStatus, String reason) {
        log.info("Updating booking {} status to {} with reason: {}", bookingId, newStatus, reason);
        
        Booking booking = getBookingById(bookingId);
        
        // Validate status transition
        if (!isValidStatusTransition(booking.getStatus(), newStatus)) {
            throw new IllegalArgumentException(
                    String.format("Invalid status transition from %s to %s", booking.getStatus(), newStatus));
        }
        
        booking.setStatus(newStatus);
        booking.setUpdatedAt(ZonedDateTime.now());
        
        if (reason != null && !reason.trim().isEmpty()) {
            booking.setNotes(booking.getNotes() != null ? 
                    booking.getNotes() + "\nStatus updated: " + reason : 
                    "Status updated: " + reason);
        }
        
        return bookingRepository.save(booking);
    }

    /**
     * Cancel booking (Admin operation)
     */
    @Transactional
    public Booking cancelBooking(UUID bookingId, String reason) {
        log.info("Cancelling booking {} with reason: {}", bookingId, reason);
        
        Booking booking = getBookingById(bookingId);
        
        // Check if booking can be cancelled
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled");
        }
        
        if (booking.getStatus() == BookingStatus.PAID) {
            throw new IllegalStateException("Cannot cancel paid booking without refund process");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(ZonedDateTime.now());
        
        if (reason != null && !reason.trim().isEmpty()) {
            booking.setNotes(booking.getNotes() != null ? 
                    booking.getNotes() + "\nCancelled: " + reason : 
                    "Cancelled: " + reason);
        }
        
        return bookingRepository.save(booking);
    }

    /**
     * Search bookings with text search (searches in booking reference, customer info, and product details)
     */
    @Transactional(readOnly = true)
    public Page<Booking> searchBookings(String searchTerm, Pageable pageable) {
        log.debug("Searching bookings with term: {}", searchTerm);
        
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return bookingRepository.findAll(pageable);
        }
        
        return bookingRepository.searchBookings(searchTerm.trim(), pageable);
    }

    /**
     * Get booking summary for dashboard
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getBookingSummary(LocalDate startDate, LocalDate endDate) {
        log.debug("Generating booking summary for period: {} to {}", startDate, endDate);
        
        Map<String, Object> summary = new HashMap<>();
        
        // Basic counts
        Long totalBookings = bookingRepository.countBookingsInPeriod(startDate, endDate);
        Long confirmedBookings = bookingRepository.countBookingsByStatusInPeriod(
                BookingStatus.CONFIRMED, startDate, endDate);
        Long pendingBookings = bookingRepository.countBookingsByStatusInPeriod(
                BookingStatus.PENDING, startDate, endDate);
        Long cancelledBookings = bookingRepository.countBookingsByStatusInPeriod(
                BookingStatus.CANCELLED, startDate, endDate);
        
        summary.put("totalBookings", totalBookings);
        summary.put("confirmedBookings", confirmedBookings);
        summary.put("pendingBookings", pendingBookings);
        summary.put("cancelledBookings", cancelledBookings);
        
        // Type breakdown
        Map<String, Long> typeBreakdown = new HashMap<>();
        for (BookingType type : BookingType.values()) {
            Long count = bookingRepository.countBookingsByTypeInPeriod(type, startDate, endDate);
            typeBreakdown.put(type.name(), count);
        }
        summary.put("typeBreakdown", typeBreakdown);
        
        // Revenue
        Double totalRevenue = bookingRepository.getTotalRevenueInPeriod(startDate, endDate);
        summary.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        
        return summary;
    }

    /**
     * Validate status transitions
     */
    private boolean isValidStatusTransition(BookingStatus currentStatus, BookingStatus newStatus) {
        if (currentStatus == newStatus) {
            return true;
        }
        
        switch (currentStatus) {
            case PENDING:
                return newStatus == BookingStatus.CONFIRMED || 
                       newStatus == BookingStatus.CANCELLED;
            case CONFIRMED:
                return newStatus == BookingStatus.PAYMENT_PENDING || 
                       newStatus == BookingStatus.PAID ||
                       newStatus == BookingStatus.CANCELLED;
            case PAYMENT_PENDING:
                return newStatus == BookingStatus.PAID ||
                       newStatus == BookingStatus.PAYMENT_FAILED ||
                       newStatus == BookingStatus.CANCELLED;
            case CANCELLED:
                return false; // Cannot change from cancelled
            case PAID:
                return false; // Cannot change from paid without special process
            case PAYMENT_FAILED:
                return newStatus == BookingStatus.PAYMENT_PENDING ||
                       newStatus == BookingStatus.CANCELLED;
            default:
                return false;
        }
    }
}
