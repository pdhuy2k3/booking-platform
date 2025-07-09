package com.pdh.booking.service;

import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.repository.BookingRepository;
import com.pdh.common.event.booking.BookingInitiatedEvent;
import com.pdh.common.event.booking.BookingConfirmedEvent;
import com.pdh.common.event.booking.BookingCancelledEvent;
import com.pdh.common.event.booking.BookingFailedEvent;
import com.pdh.booking.outbox.OutboxEventPublisher;
import com.pdh.common.saga.SagaState;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Domain service for managing booking lifecycle and publishing domain events
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class BookingDomainService {

    private final BookingRepository bookingRepository;
    private final OutboxEventPublisher outboxEventPublisher;

    /**
     * Create a new booking and publish BookingInitiatedEvent
     */
    @Transactional
    public Booking createBooking(Booking booking) {
        log.info("Creating booking with reference: {}", booking.getBookingReference());
        
        // Set initial status and saga state
        booking.setStatus(BookingStatus.PENDING);
        booking.setSagaState(SagaState.BOOKING_INITIATED);
        
        // Save booking
        Booking savedBooking = bookingRepository.save(booking);
        
        // Publish domain event to outbox
        BookingInitiatedEvent event = BookingInitiatedEvent.builder()
                .bookingId(savedBooking.getBookingId())
                .sagaId(savedBooking.getSagaId())
                .userId(savedBooking.getUserId())
                .bookingReference(savedBooking.getBookingReference())
                .bookingType(savedBooking.getBookingType().toString())
                .totalAmount(savedBooking.getTotalAmount())
                .currency(savedBooking.getCurrency())
                .timestamp(ZonedDateTime.now())
                .build();
        
        outboxEventPublisher.publishEvent(event, savedBooking.getBookingId().toString());
        
        log.info("Booking created and BookingInitiatedEvent published for booking: {}", savedBooking.getBookingReference());
        return savedBooking;
    }

    /**
     * Update booking status and saga state, publish appropriate domain event
     */
    @Transactional
    public Optional<Booking> updateBookingStatus(UUID bookingId, BookingStatus newStatus, SagaState newSagaState) {
        return updateBookingStatus(bookingId, newStatus, newSagaState, null);
    }

    /**
     * Update booking status and saga state with reason, publish appropriate domain event
     */
    @Transactional
    public Optional<Booking> updateBookingStatus(UUID bookingId, BookingStatus newStatus, SagaState newSagaState, String reason) {
        Optional<Booking> bookingOpt = bookingRepository.findByBookingId(bookingId);
        
        if (bookingOpt.isEmpty()) {
            log.warn("Booking not found with id: {}", bookingId);
            return Optional.empty();
        }
        
        Booking booking = bookingOpt.get();
        BookingStatus oldStatus = booking.getStatus();
        SagaState oldSagaState = booking.getSagaState();
        
        // Update booking
        booking.setStatus(newStatus);
        booking.setSagaState(newSagaState);
        
        Booking savedBooking = bookingRepository.save(booking);
        
        // Publish appropriate domain event based on new status
        publishBookingStatusEvent(savedBooking, oldStatus, newStatus, reason);
        
        log.info("Booking {} status updated from {} to {}, saga state from {} to {}", 
                booking.getBookingReference(), oldStatus, newStatus, oldSagaState, newSagaState);
        
        return Optional.of(savedBooking);
    }

    /**
     * Update saga state only
     */
    @Transactional
    public Optional<Booking> updateSagaState(UUID bookingId, SagaState newSagaState) {
        Optional<Booking> bookingOpt = bookingRepository.findByBookingId(bookingId);
        
        if (bookingOpt.isEmpty()) {
            log.warn("Booking not found with id: {}", bookingId);
            return Optional.empty();
        }
        
        Booking booking = bookingOpt.get();
        SagaState oldSagaState = booking.getSagaState();
        booking.setSagaState(newSagaState);
        
        Booking savedBooking = bookingRepository.save(booking);
        
        log.info("Booking {} saga state updated from {} to {}", 
                booking.getBookingReference(), oldSagaState, newSagaState);
        
        return Optional.of(savedBooking);
    }

    /**
     * Find booking by saga ID
     */
    public Optional<Booking> findBySagaId(String sagaId) {
        return bookingRepository.findBySagaId(sagaId);
    }

    /**
     * Find booking by booking ID
     */
    public Optional<Booking> findByBookingId(UUID bookingId) {
        return bookingRepository.findByBookingId(bookingId);
    }

    /**
     * Confirm booking and set confirmation number
     */
    @Transactional
    public Optional<Booking> confirmBooking(UUID bookingId, String confirmationNumber) {
        Optional<Booking> bookingOpt = bookingRepository.findByBookingId(bookingId);
        
        if (bookingOpt.isEmpty()) {
            log.warn("Booking not found with id: {}", bookingId);
            return Optional.empty();
        }
        
        Booking booking = bookingOpt.get();
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setSagaState(SagaState.BOOKING_COMPLETED);
        booking.setConfirmationNumber(confirmationNumber);
        
        Booking savedBooking = bookingRepository.save(booking);
        
        // Publish confirmation event
        BookingConfirmedEvent event = BookingConfirmedEvent.builder()
                .bookingId(savedBooking.getBookingId())
                .sagaId(savedBooking.getSagaId())
                .userId(savedBooking.getUserId())
                .bookingReference(savedBooking.getBookingReference())
                .confirmationNumber(confirmationNumber)
                .timestamp(ZonedDateTime.now())
                .build();
        
        outboxEventPublisher.publishEvent(event, savedBooking.getBookingId().toString());
        
        log.info("Booking {} confirmed with confirmation number: {}", booking.getBookingReference(), confirmationNumber);
        return Optional.of(savedBooking);
    }

    /**
     * Publish appropriate domain event based on booking status change
     */
    private void publishBookingStatusEvent(Booking booking, BookingStatus oldStatus, BookingStatus newStatus, String reason) {
        switch (newStatus) {
            case CONFIRMED -> {
                BookingConfirmedEvent confirmedEvent = BookingConfirmedEvent.builder()
                        .bookingId(booking.getBookingId())
                        .sagaId(booking.getSagaId())
                        .userId(booking.getUserId())
                        .bookingReference(booking.getBookingReference())
                        .confirmationNumber(booking.getConfirmationNumber())
                        .timestamp(ZonedDateTime.now())
                        .build();
                outboxEventPublisher.publishEvent(confirmedEvent, booking.getBookingId().toString());
            }
            
            case CANCELLED -> {
                BookingCancelledEvent cancelledEvent = BookingCancelledEvent.builder()
                        .bookingId(booking.getBookingId())
                        .sagaId(booking.getSagaId())
                        .userId(booking.getUserId())
                        .bookingReference(booking.getBookingReference())
                        .cancellationReason(reason != null ? reason : booking.getCancellationReason())
                        .timestamp(ZonedDateTime.now())
                        .build();
                outboxEventPublisher.publishEvent(cancelledEvent, booking.getBookingId().toString());
            }
            
            case FAILED -> {
                BookingFailedEvent failedEvent = BookingFailedEvent.builder()
                        .bookingId(booking.getBookingId())
                        .sagaId(booking.getSagaId())
                        .userId(booking.getUserId())
                        .bookingReference(booking.getBookingReference())
                        .failureReason(reason != null ? reason : "Booking processing failed")
                        .timestamp(ZonedDateTime.now())
                        .build();
                outboxEventPublisher.publishEvent(failedEvent, booking.getBookingId().toString());
            }
            
            default -> {
                // For other status changes, we might want to publish generic events
                log.debug("No specific event published for status change from {} to {} for booking {}", 
                        oldStatus, newStatus, booking.getBookingReference());
            }
        }
    }
}
