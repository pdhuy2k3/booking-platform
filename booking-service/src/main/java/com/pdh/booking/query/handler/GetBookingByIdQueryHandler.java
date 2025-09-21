package com.pdh.booking.query.handler;

import com.pdh.booking.model.Booking;
import com.pdh.booking.query.GetBookingByIdQuery;
import com.pdh.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Query handler for getting booking by ID
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class GetBookingByIdQueryHandler {
    
    private final BookingRepository bookingRepository;
    
    public Optional<Booking> handle(GetBookingByIdQuery query) {
        log.debug("Processing GetBookingByIdQuery for booking: {}", query.getBookingId());
        
        try {
            Optional<Booking> booking = bookingRepository.findByBookingId(query.getBookingId());
            
            // Optional authorization check
            if (booking.isPresent() && query.getUserId() != null) {
                if (!booking.get().getUserId().equals(query.getUserId())) {
                    log.warn("Unauthorized access attempt for booking: {} by user: {}", 
                            query.getBookingId(), query.getUserId());
                    return Optional.empty();
                }
            }
            
            return booking;
            
        } catch (Exception e) {
            log.error("Error processing GetBookingByIdQuery: {}", e.getMessage(), e);
            return Optional.empty();
        }
    }
}
