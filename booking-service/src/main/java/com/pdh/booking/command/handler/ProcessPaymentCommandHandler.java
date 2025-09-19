package com.pdh.booking.command.handler;

import com.pdh.booking.command.ProcessPaymentCommand;
import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.repository.BookingRepository;
import com.pdh.booking.service.BookingOutboxEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

/**
 * Command handler for processing payments
 * This handler publishes payment events to the saga orchestrator
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ProcessPaymentCommandHandler {
    
    private final BookingRepository bookingRepository;
    private final BookingOutboxEventService outboxEventService;
    
    @Transactional
    public void handle(ProcessPaymentCommand command) {
        log.info("Processing ProcessPaymentCommand for booking: {}", command.getBookingId());
        
        try {
            // Find the booking
            Optional<Booking> bookingOpt = bookingRepository.findByBookingId(command.getBookingId());
            if (bookingOpt.isEmpty()) {
                throw new RuntimeException("Booking not found: " + command.getBookingId());
            }
            
            Booking booking = bookingOpt.get();

            if (command.getCurrency() == null && booking.getCurrency() != null) {
                command.setCurrency(booking.getCurrency());
            }
            if (command.getCurrency() != null) {
                command.setCurrency(command.getCurrency().toUpperCase());
            }

            // Update booking status
            booking.setStatus(BookingStatus.PAYMENT_PENDING);
            bookingRepository.save(booking);
            
            // Publish payment command event to saga orchestrator
            outboxEventService.publishEvent(
                "PaymentCommand",
                "BookingSaga",
                command.getSagaId(),
                createPaymentEventPayload(command)
            );
            
            log.info("Payment command published for booking: {}", command.getBookingId());
            
        } catch (Exception e) {
            log.error("Error processing ProcessPaymentCommand: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process payment: " + e.getMessage(), e);
        }
    }
    
    private Object createPaymentEventPayload(ProcessPaymentCommand command) {
        // Create a simple map-like object for the event payload
        return Map.of(
            "sagaId", command.getSagaId(),
            "bookingId", command.getBookingId().toString(),
            "userId", command.getUserId().toString(),
            "amount", command.getAmount().toString(),
            "currency", Optional.ofNullable(command.getCurrency()).orElse("USD"),
            "paymentMethod", command.getPaymentMethod(),
            "paymentDetailsJson", command.getPaymentDetailsJson(),
            "correlationId", command.getCorrelationId(),
            "timestamp", System.currentTimeMillis()
        );
    }
}
