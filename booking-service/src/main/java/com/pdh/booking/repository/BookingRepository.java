package com.pdh.booking.repository;

import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.model.enums.BookingType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.method.P;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;


public interface BookingRepository extends JpaRepository<Booking, UUID> {
    
    Optional<Booking> findByBookingReference(String bookingReference);
    
    // Saga Pattern support
    Optional<Booking> findByBookingId(UUID bookingId);
    Optional<Booking> findBySagaId(String sagaId);
    
    List<Booking> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Page<Booking> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    List<Booking> findByStatus(BookingStatus status);
    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);
    List<Booking> findByBookingType(BookingType bookingType);
    Page<Booking> findByBookingType(BookingType bookingType, Pageable pageable);
    
    List<Booking> findByUserIdAndBookingType(UUID userId, BookingType bookingType);
    
    @Query("SELECT b FROM Booking b WHERE b.userId = :userId AND b.status IN :statuses")
    List<Booking> findByUserIdAndStatusIn(@Param("userId") UUID userId, 
                                         @Param("statuses") List<BookingStatus> statuses);
    
    @Query("SELECT b FROM Booking b WHERE b.createdAt BETWEEN :startDate AND :endDate")
    List<Booking> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                        @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
    Long countByStatus(@Param("status") BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.createdAt >= :today AND b.status = 'CONFIRMED'")
    List<Booking> findUpcomingBookings(@Param("today") java.time.LocalDate today);

    // === BACKOFFICE JSONB QUERY METHODS ===

    /**
     * Find bookings with multiple filters
     */
    @Query("SELECT b FROM Booking b WHERE " +
           "(:bookingType IS NULL OR b.bookingType = :bookingType) AND " +
           "(:status IS NULL OR b.status = :status) AND " +
           "(:startDate IS NULL OR DATE(b.createdAt) >= :startDate) AND " +
           "(:endDate IS NULL OR DATE(b.createdAt) <= :endDate) " +
           "ORDER BY b.createdAt DESC")
    Page<Booking> findBookingsWithFilters(@Param("bookingType") BookingType bookingType,
                                         @Param("status") BookingStatus status,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate,
                                         Pageable pageable);

    /**
     * Find flight bookings by airline using JSONB query
     */
    @Query(value = "SELECT * FROM bookings WHERE booking_type = 'FLIGHT' AND " +
                   "product_details->>'airline' ILIKE %:airline% " +
                   "ORDER BY created_at DESC", nativeQuery = true)
    Page<Booking> findFlightBookingsByAirline(@Param("airline") String airline, Pageable pageable);

    /**
     * Find flight bookings by route using JSONB query
     */
    @Query(value = "SELECT * FROM bookings WHERE booking_type = 'FLIGHT' AND " +
                   "product_details->>'originAirport' = :departureAirport AND " +
                   "product_details->>'destinationAirport' = :arrivalAirport " +
                   "ORDER BY created_at DESC", nativeQuery = true)
    Page<Booking> findFlightBookingsByRoute(@Param("departureAirport") String departureAirport,
                                           @Param("arrivalAirport") String arrivalAirport,
                                           Pageable pageable);

    /**
     * Find flight bookings by departure date range using JSONB query
     */
    @Query(value = "SELECT * FROM bookings WHERE booking_type = 'FLIGHT' AND " +
                   "DATE(CAST(product_details->>'departureDateTime' AS timestamp)) BETWEEN :startDate AND :endDate " +
                   "ORDER BY created_at DESC", nativeQuery = true)
    Page<Booking> findFlightBookingsByDepartureDate(@Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate,
                                                   Pageable pageable);

    /**
     * Find hotel bookings by hotel name using JSONB query
     */
    @Query(value = "SELECT * FROM bookings WHERE booking_type = 'HOTEL' AND " +
                   "product_details->>'hotelName' ILIKE %:hotelName% " +
                   "ORDER BY created_at DESC", nativeQuery = true)
    Page<Booking> findHotelBookingsByHotelName(@Param("hotelName") String hotelName, Pageable pageable);

    /**
     * Find hotel bookings by location using JSONB query
     */
    @Query(value = "SELECT * FROM bookings WHERE booking_type = 'HOTEL' AND " +
                   "product_details->>'city' ILIKE %:city% " +
                   "ORDER BY created_at DESC", nativeQuery = true)
    Page<Booking> findHotelBookingsByLocation(@Param("city") String city, Pageable pageable);

    /**
     * Find hotel bookings by check-in date range using JSONB query
     */
    @Query(value = "SELECT * FROM bookings WHERE booking_type = 'HOTEL' AND " +
                   "DATE(CAST(product_details->>'checkInDate' AS date)) BETWEEN :startDate AND :endDate " +
                   "ORDER BY created_at DESC", nativeQuery = true)
    Page<Booking> findHotelBookingsByCheckInDate(@Param("startDate") LocalDate startDate,
                                                @Param("endDate") LocalDate endDate,
                                                Pageable pageable);

    // === STATISTICAL QUERY METHODS ===

    /**
     * Count bookings in a date period
     */
    @Query("SELECT COUNT(b) FROM Booking b WHERE " +
           "(:startDate IS NULL OR DATE(b.createdAt) >= :startDate) AND " +
           "(:endDate IS NULL OR DATE(b.createdAt) <= :endDate)")
    Long countBookingsInPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * Count bookings by type in a period
     */
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.bookingType = :bookingType AND " +
           "(:startDate IS NULL OR DATE(b.createdAt) >= :startDate) AND " +
           "(:endDate IS NULL OR DATE(b.createdAt) <= :endDate)")
    Long countBookingsByTypeInPeriod(@Param("bookingType") BookingType bookingType,
                                   @Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate);

    /**
     * Count bookings by status in a period
     */
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status AND " +
           "(:startDate IS NULL OR DATE(b.createdAt) >= :startDate) AND " +
           "(:endDate IS NULL OR DATE(b.createdAt) <= :endDate)")
    Long countBookingsByStatusInPeriod(@Param("status") BookingStatus status,
                                     @Param("startDate") LocalDate startDate,
                                     @Param("endDate") LocalDate endDate);

    /**
     * Get total revenue in a period
     */
    @Query("SELECT SUM(b.totalAmount) FROM Booking b WHERE b.status = 'CONFIRMED' AND " +
           "(:startDate IS NULL OR DATE(b.createdAt) >= :startDate) AND " +
           "(:endDate IS NULL OR DATE(b.createdAt) <= :endDate)")
    Double getTotalRevenueInPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * Get average booking value in a period
     */
    @Query("SELECT AVG(b.totalAmount) FROM Booking b WHERE b.status = 'CONFIRMED' AND " +
           "(:startDate IS NULL OR DATE(b.createdAt) >= :startDate) AND " +
           "(:endDate IS NULL OR DATE(b.createdAt) <= :endDate)")
    Double getAverageBookingValueInPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // === ANALYTICS QUERY METHODS ===

    /**
     * Get popular flight destinations
     */
    @Query(value = "SELECT product_details->>'destinationAirport' as destination, COUNT(*) as booking_count " +
                   "FROM bookings WHERE booking_type = 'FLIGHT' AND status = 'CONFIRMED' AND " +
                   "(:startDate IS NULL OR DATE(created_at) >= :startDate) AND " +
                   "(:endDate IS NULL OR DATE(created_at) <= :endDate) " +
                   "GROUP BY product_details->>'destinationAirport' " +
                   "ORDER BY booking_count DESC LIMIT 10", nativeQuery = true)
    List<Map<String, Object>> getPopularFlightDestinations(@Param("startDate") LocalDate startDate,
                                                          @Param("endDate") LocalDate endDate);

    /**
     * Get popular hotel destinations
     */
    @Query(value = "SELECT product_details->>'city' as destination, COUNT(*) as booking_count " +
                   "FROM bookings WHERE booking_type = 'HOTEL' AND status = 'CONFIRMED' AND " +
                   "(:startDate IS NULL OR DATE(created_at) >= :startDate) AND " +
                   "(:endDate IS NULL OR DATE(created_at) <= :endDate) " +
                   "GROUP BY product_details->>'city' " +
                   "ORDER BY booking_count DESC LIMIT 10", nativeQuery = true)
    List<Map<String, Object>> getPopularHotelDestinations(@Param("startDate") LocalDate startDate,
                                                         @Param("endDate") LocalDate endDate);

    /**
     * Get daily revenue
     */
    @Query(value = "SELECT DATE(created_at) as date, SUM(total_amount) as revenue " +
                   "FROM bookings WHERE status = 'CONFIRMED' AND " +
                   "(:startDate IS NULL OR DATE(created_at) >= :startDate) AND " +
                   "(:endDate IS NULL OR DATE(created_at) <= :endDate) " +
                   "GROUP BY DATE(created_at) ORDER BY date", nativeQuery = true)
    List<Map<String, Object>> getDailyRevenue(@Param("startDate") LocalDate startDate,
                                            @Param("endDate") LocalDate endDate);

    /**
     * Get monthly revenue
     */
    @Query(value = "SELECT DATE_TRUNC('month', created_at) as month, SUM(total_amount) as revenue " +
                   "FROM bookings WHERE status = 'CONFIRMED' AND " +
                   "(:startDate IS NULL OR DATE(created_at) >= :startDate) AND " +
                   "(:endDate IS NULL OR DATE(created_at) <= :endDate) " +
                   "GROUP BY DATE_TRUNC('month', created_at) ORDER BY month", nativeQuery = true)
    List<Map<String, Object>> getMonthlyRevenue(@Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);

    /**
     * Get revenue by booking type
     */
    @Query(value = "SELECT booking_type, SUM(total_amount) as revenue, COUNT(*) as booking_count " +
                   "FROM bookings WHERE status = 'CONFIRMED' AND " +
                   "(:startDate IS NULL OR DATE(created_at) >= :startDate) AND " +
                   "(:endDate IS NULL OR DATE(created_at) <= :endDate) " +
                   "GROUP BY booking_type ORDER BY revenue DESC", nativeQuery = true)
    List<Map<String, Object>> getRevenueByBookingType(@Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate);

    /**
     * Search bookings by text (booking reference, customer info, product details)
     */
    @Query(value = "SELECT * FROM bookings WHERE " +
                   "booking_reference ILIKE CONCAT('%', :searchTerm, '%') OR " +
                   "CAST(product_details AS TEXT) ILIKE CONCAT('%', :searchTerm, '%') OR " +
                   "notes ILIKE CONCAT('%', :searchTerm, '%') " +
                   "ORDER BY created_at DESC", nativeQuery = true)
    Page<Booking> searchBookings(@Param("searchTerm") String searchTerm, Pageable pageable);
}
