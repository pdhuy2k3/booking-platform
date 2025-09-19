package com.pdh.booking.service;

import com.pdh.booking.model.Booking;
import com.pdh.booking.saga.BookingSagaOrchestrator;
import com.pdh.common.utils.AuthenticationUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * Saga orchestration service for booking flows
 * Now properly integrated with event-driven BookingSagaOrchestrator
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class BookingSagaService {

    private final BookingService bookingService;
    private final BookingSagaOrchestrator sagaOrchestrator;

    /**
     * Start the booking saga using event-driven orchestrator
     */
    @Transactional
    public Booking startBookingSaga(Booking booking) {
        log.info("Starting booking saga for booking: {}", booking.getBookingReference());

        // Set user ID from authentication context
        booking.setUserId(UUID.fromString(AuthenticationUtils.extractUserId()));

        // Create booking entity (no direct processing)
        Booking savedBooking = bookingService.createBooking(booking);

        // The saga orchestration is started via the AsyncInventoryValidationService
        // when the inventory validation is completed successfully
        
        log.info("Booking created and validation initiated for: {}", savedBooking.getBookingReference());
        return savedBooking;
    }

    /**
     * Continue the booking saga after validation is complete
     * This method is called by the AsyncInventoryValidationService
     */
    @Transactional
    public void continueBookingSaga(Booking booking) {
        log.info("Continuing booking saga for booking: {}", booking.getBookingReference());
        
        // Start event-driven saga orchestration
        sagaOrchestrator.startBookingSaga(booking.getBookingId());
        
        log.info("Saga orchestration started for booking: {}", booking.getBookingReference());
    }

    /**
     * Find booking by saga ID
     */
    public Optional<Booking> findBySagaId(String sagaId) {
        return bookingService.findBySagaId(sagaId);
    }
}
