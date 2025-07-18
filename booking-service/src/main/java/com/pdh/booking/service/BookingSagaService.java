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

    private final BookingDomainService bookingDomainService;
    private final BookingSagaOrchestrator sagaOrchestrator;

    /**
     * Start the booking saga using event-driven orchestrator
     */
    @Transactional
    public Booking startBookingSaga(Booking booking) {
        log.info("Starting booking saga for booking: {}", booking.getBookingReference());

        // Set user ID from authentication context
        booking.setUserId(UUID.fromString(AuthenticationUtils.extractUserId()));

        // Create booking and publish BookingInitiatedEvent via domain service
        Booking savedBooking = bookingDomainService.createBooking(booking);

        // Start event-driven saga orchestration
        sagaOrchestrator.startBookingSaga(savedBooking.getBookingId());

        log.info("Booking created and saga orchestration started for: {}", savedBooking.getBookingReference());
        return savedBooking;
    }

    /**
     * Find booking by saga ID
     */
    public Optional<Booking> findBySagaId(String sagaId) {
        return bookingDomainService.findBySagaId(sagaId);
    }
}
