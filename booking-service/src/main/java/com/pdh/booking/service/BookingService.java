package com.pdh.booking.service;

import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.repository.BookingRepository;
import com.pdh.booking.saga.BookingSagaOrchestrator;
import com.pdh.common.saga.SagaState;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service demonstrating integration with the Saga orchestrator
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final BookingSagaOrchestrator sagaOrchestrator;
    
    /**
     * Create a new booking and start the saga
     */
    @Transactional
    public Booking createBooking(Booking booking) {
        log.info("Creating new booking: {}", booking.getBookingId());
        
        // Set initial states
        booking.setStatus(BookingStatus.PENDING);
        booking.setSagaState(SagaState.BOOKING_INITIATED);
        
        // Save booking
        booking = bookingRepository.save(booking);
        
        // Start saga process
        sagaOrchestrator.startBookingSaga(booking.getBookingId());
        
        log.info("Booking created and saga started: {}", booking.getBookingId());
        return booking;
    }
    
    /**
     * Find booking by ID
     */
    public Booking findById(UUID bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
    }
    
    /**
     * Update booking status when saga completes
     */
    @Transactional
    public void completeBooking(UUID bookingId, String confirmationNumber) {
        log.info("Completing booking: {}", bookingId);
        
        Booking booking = findById(bookingId);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setConfirmationNumber(confirmationNumber);
        booking.setSagaState(SagaState.BOOKING_COMPLETED);
        
        bookingRepository.save(booking);
        
        log.info("Booking completed: {} with confirmation: {}", bookingId, confirmationNumber);
    }
    
    /**
     * Cancel booking when saga fails
     */
    @Transactional
    public void cancelBooking(UUID bookingId, String reason) {
        log.info("Cancelling booking: {} due to: {}", bookingId, reason);
        
        Booking booking = findById(bookingId);
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setSagaState(SagaState.BOOKING_CANCELLED);
        
        bookingRepository.save(booking);
        
        log.info("Booking cancelled: {}", bookingId);
    }
}
