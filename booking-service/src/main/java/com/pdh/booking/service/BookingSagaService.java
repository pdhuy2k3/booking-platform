package com.pdh.booking.service;

import com.pdh.booking.model.Booking;
import com.pdh.booking.model.BookingSagaInstance;
import com.pdh.booking.repository.BookingSagaRepository;
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
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class BookingSagaService {

    private final BookingDomainService bookingDomainService;
    private final BookingSagaOrchestrator sagaOrchestrator;
    private final BookingSagaRepository sagaRepository;

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

    // Listen to Yourself Pattern verification methods

    /**
     * Verify that a booking was actually created
     */
    public boolean verifyBookingCreated(UUID bookingId) {
        log.info("Verifying booking creation: bookingId={}", bookingId);

        try {
            Optional<Booking> bookingOpt = bookingDomainService.findByBookingId(bookingId);
            if (bookingOpt.isEmpty()) {
                log.warn("Booking not found: bookingId={}", bookingId);
                return false;
            }

            Booking booking = bookingOpt.get();
            log.info("Booking creation verified: bookingId={}, status={}", bookingId, booking.getStatus());
            return true;

        } catch (Exception e) {
            log.error("Error verifying booking creation: bookingId={}", bookingId, e);
            return false;
        }
    }

    /**
     * Verify that a booking is confirmed and saga completed
     */
    public boolean verifyBookingConfirmed(UUID bookingId) {
        log.info("Verifying booking confirmation: bookingId={}", bookingId);

        try {
            Optional<Booking> bookingOpt = bookingDomainService.findByBookingId(bookingId);
            if (bookingOpt.isEmpty()) {
                log.warn("Booking not found: bookingId={}", bookingId);
                return false;
            }

            Booking booking = bookingOpt.get();
            boolean isConfirmed = booking.getStatus().name().equals("CONFIRMED");

            if (!isConfirmed) {
                log.warn("Booking not confirmed: bookingId={}, status={}", bookingId, booking.getStatus());
                return false;
            }

            log.info("Booking confirmation verified: bookingId={}", bookingId);
            return true;

        } catch (Exception e) {
            log.error("Error verifying booking confirmation: bookingId={}", bookingId, e);
            return false;
        }
    }

    /**
     * Verify that a booking is cancelled
     */
    public boolean verifyBookingCancelled(UUID bookingId) {
        log.info("Verifying booking cancellation: bookingId={}", bookingId);

        try {
            Optional<Booking> bookingOpt = bookingDomainService.findByBookingId(bookingId);
            if (bookingOpt.isEmpty()) {
                log.warn("Booking not found: bookingId={}", bookingId);
                return false;
            }

            Booking booking = bookingOpt.get();
            boolean isCancelled = booking.getStatus().name().equals("CANCELLED");

            log.info("Booking cancellation verified: bookingId={}, cancelled={}", bookingId, isCancelled);
            return isCancelled;

        } catch (Exception e) {
            log.error("Error verifying booking cancellation: bookingId={}", bookingId, e);
            return false;
        }
    }

    /**
     * Verify that a booking is in failed state
     */
    public boolean verifyBookingFailed(UUID bookingId) {
        log.info("Verifying booking failure: bookingId={}", bookingId);

        try {
            Optional<Booking> bookingOpt = bookingDomainService.findByBookingId(bookingId);
            if (bookingOpt.isEmpty()) {
                log.warn("Booking not found: bookingId={}", bookingId);
                return false;
            }

            Booking booking = bookingOpt.get();
            boolean isFailed = booking.getStatus().name().equals("FAILED");

            log.info("Booking failure verified: bookingId={}, failed={}", bookingId, isFailed);
            return isFailed;

        } catch (Exception e) {
            log.error("Error verifying booking failure: bookingId={}", bookingId, e);
            return false;
        }
    }

    /**
     * Verify that a saga was started correctly
     */
    public boolean verifySagaStarted(String sagaId) {
        log.info("Verifying saga start: sagaId={}", sagaId);

        try {
            Optional<BookingSagaInstance> sagaOpt = sagaRepository.findById(sagaId);
            if (sagaOpt.isEmpty()) {
                log.warn("Saga not found: sagaId={}", sagaId);
                return false;
            }

            BookingSagaInstance saga = sagaOpt.get();
            log.info("Saga start verified: sagaId={}, state={}", sagaId, saga.getCurrentState());
            return true;

        } catch (Exception e) {
            log.error("Error verifying saga start: sagaId={}", sagaId, e);
            return false;
        }
    }

    /**
     * Verify that a saga completed successfully
     */
    public boolean verifySagaCompleted(String sagaId) {
        log.info("Verifying saga completion: sagaId={}", sagaId);

        try {
            Optional<BookingSagaInstance> sagaOpt = sagaRepository.findById(sagaId);
            if (sagaOpt.isEmpty()) {
                log.warn("Saga not found: sagaId={}", sagaId);
                return false;
            }

            BookingSagaInstance saga = sagaOpt.get();
            boolean isCompleted = saga.getCurrentState().name().equals("BOOKING_COMPLETED");

            if (!isCompleted) {
                log.warn("Saga not completed: sagaId={}, state={}", sagaId, saga.getCurrentState());
                return false;
            }

            log.info("Saga completion verified: sagaId={}", sagaId);
            return true;

        } catch (Exception e) {
            log.error("Error verifying saga completion: sagaId={}", sagaId, e);
            return false;
        }
    }

    /**
     * Verify that a saga is in failed state
     */
    public boolean verifySagaFailed(String sagaId) {
        log.info("Verifying saga failure: sagaId={}", sagaId);

        try {
            Optional<BookingSagaInstance> sagaOpt = sagaRepository.findById(sagaId);
            if (sagaOpt.isEmpty()) {
                log.warn("Saga not found: sagaId={}", sagaId);
                return false;
            }

            BookingSagaInstance saga = sagaOpt.get();
            boolean isFailed = saga.getCurrentState().name().contains("FAILED") ||
                              saga.getCurrentState().name().contains("COMPENSATION");

            log.info("Saga failure verified: sagaId={}, failed={}, state={}", sagaId, isFailed, saga.getCurrentState());
            return isFailed;

        } catch (Exception e) {
            log.error("Error verifying saga failure: sagaId={}", sagaId, e);
            return false;
        }
    }

    /**
     * Verify that saga compensation completed
     */
    public boolean verifySagaCompensated(String sagaId) {
        log.info("Verifying saga compensation: sagaId={}", sagaId);

        try {
            Optional<BookingSagaInstance> sagaOpt = sagaRepository.findById(sagaId);
            if (sagaOpt.isEmpty()) {
                log.warn("Saga not found: sagaId={}", sagaId);
                return false;
            }

            BookingSagaInstance saga = sagaOpt.get();
            boolean isCompensated = saga.getCurrentState().name().equals("BOOKING_CANCELLED") ||
                                   saga.getCurrentState().name().contains("COMPENSATION");

            log.info("Saga compensation verified: sagaId={}, compensated={}, state={}",
                    sagaId, isCompensated, saga.getCurrentState());
            return isCompensated;

        } catch (Exception e) {
            log.error("Error verifying saga compensation: sagaId={}", sagaId, e);
            return false;
        }
    }
}
