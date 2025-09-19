package com.pdh.booking.repository;

import com.pdh.booking.model.BookingPassenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookingPassengerRepository extends JpaRepository<BookingPassenger, Long> {
    List<BookingPassenger> findByBooking_BookingId(UUID bookingId);
    List<BookingPassenger> findByBooking_BookingIdOrderByDisplayOrder(UUID bookingId);
}