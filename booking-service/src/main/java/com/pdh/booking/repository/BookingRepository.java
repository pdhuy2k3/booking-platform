package com.pdh.booking.repository;

import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.model.enums.BookingType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    
    Optional<Booking> findByBookingReference(String bookingReference);
    
    List<Booking> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    List<Booking> findByStatus(BookingStatus status);
    
    List<Booking> findByBookingType(BookingType bookingType);
    
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
}
