package com.pdh.booking.command.handler;

import com.pdh.booking.command.CancelBookingCommand;
import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.repository.BookingRepository;
import com.pdh.booking.service.BookingOutboxEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.Map;
import java.util.Optional;

/**
 * Command handler for canceling bookings
 * This handler triggers the compensation saga
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CancelBookingCommandHandler {
    
    private final BookingRepository bookingRepository;
    private final BookingOutboxEventService outboxEventService;
    
    @Transactional
    public void handle(CancelBookingCommand command) {
        log.info("Processing CancelBookingCommand for booking: {}", command.getBookingId());
        
        try {
            // Find the booking
            Optional<Booking> bookingOpt = bookingRepository.findByBookingId(command.getBookingId());
            if (bookingOpt.isEmpty()) {
                throw new RuntimeException("Booking not found: " + command.getBookingId());
            }
            
            Booking booking = bookingOpt.get();
            
            // Update booking status
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setCancellationReason(command.getCancellationReason());
            booking.setCancelledAt(ZonedDateTime.now());
            bookingRepository.save(booking);
            
            // Publish cancellation command event to saga orchestrator
            outboxEventService.publishEvent(
                "BookingCancellationCommand",
                "BookingSaga",
                command.getSagaId(),
                createCancellationEventPayload(command)
            );
            
            log.info("Booking cancellation command published for booking: {}", command.getBookingId());
            
        } catch (Exception e) {
            log.error("Error processing CancelBookingCommand: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to cancel booking: " + e.getMessage(), e);
        }
    }
    
    private Object createCancellationEventPayload(CancelBookingCommand command) {
        // Create a simple map-like object for the event payload
        return Map.of(
            "sagaId", command.getSagaId(),
            "bookingId", command.getBookingId().toString(),
            "userId", command.getUserId().toString(),
            "cancellationReason", command.getCancellationReason(),
            "correlationId", command.getCorrelationId(),
            "timestamp", System.currentTimeMillis()
        );
    }
}
