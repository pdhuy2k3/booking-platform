package com.pdh.booking.repository;

import com.pdh.booking.model.BookingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookingItemRepository extends JpaRepository<BookingItem, UUID> {
    List<BookingItem> findByBookingId(UUID bookingId);
}