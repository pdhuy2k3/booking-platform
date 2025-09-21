package com.pdh.booking.query.handler;

import com.pdh.booking.model.Booking;
import com.pdh.booking.query.GetBookingBySagaIdQuery;
import com.pdh.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Query handler for getting booking by saga ID
 * Used for saga orchestration tracking
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class GetBookingBySagaIdQueryHandler {
    
    private final BookingRepository bookingRepository;
    
    public Optional<Booking> handle(GetBookingBySagaIdQuery query) {
        log.debug("Processing GetBookingBySagaIdQuery for saga: {}", query.getSagaId());
        
        try {
            Optional<Booking> booking = bookingRepository.findBySagaId(query.getSagaId());
            
            // Optional authorization check
            if (booking.isPresent() && query.getUserId() != null) {
                if (!booking.get().getUserId().toString().equals(query.getUserId())) {
                    log.warn("Unauthorized access attempt for saga: {} by user: {}", 
                            query.getSagaId(), query.getUserId());
                    return Optional.empty();
                }
            }
            
            return booking;
            
        } catch (Exception e) {
            log.error("Error processing GetBookingBySagaIdQuery: {}", e.getMessage(), e);
            return Optional.empty();
        }
    }
}
