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
}
