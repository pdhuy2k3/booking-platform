package com.pdh.booking.service;

import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.common.saga.SagaState;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Saga orchestration service for booking flows
 * Coordinates the booking saga state machine
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class BookingSagaService {

    private final BookingDomainService bookingDomainService;
    private final FlightBookingService flightBookingService;
    private final HotelBookingService hotelBookingService;
    private final PaymentService paymentService;
    private final NotificationService notificationService;

    /**
     * Start the booking saga
     */
    @Transactional
    public Booking startBookingSaga(Booking booking) {
        log.info("Starting booking saga for booking: {}", booking.getBookingReference());
        
        // Create booking and publish BookingInitiatedEvent
        Booking savedBooking = bookingDomainService.createBooking(booking);
        
        // Start with reservation phase
        switch (booking.getBookingType()) {
            case FLIGHT -> processFlightReservation(savedBooking);
            case HOTEL -> processHotelReservation(savedBooking);
            case COMBO -> {
                processFlightReservation(savedBooking);
                processHotelReservation(savedBooking);
            }
            case BUS, TRAIN -> {
                // For transport services, we can use similar logic
                processTransportReservation(savedBooking);
            }
        }
        
        return savedBooking;
    }

    /**
     * Process flight reservation step
     */
    private void processFlightReservation(Booking booking) {
        try {
            log.info("Processing flight reservation for booking: {}", booking.getBookingReference());
            
            bookingDomainService.updateSagaState(booking.getBookingId(), SagaState.FLIGHT_RESERVATION_PENDING);
            
            // Call flight service to reserve
            boolean reserved = flightBookingService.reserveFlight(booking);
            
            if (reserved) {
                bookingDomainService.updateSagaState(booking.getBookingId(), SagaState.FLIGHT_RESERVED);
                log.info("Flight reserved successfully for booking: {}", booking.getBookingReference());
            } else {
                handleCompensation(booking, "Flight reservation failed");
            }
            
        } catch (Exception e) {
            log.error("Error processing flight reservation for booking: {}", booking.getBookingReference(), e);
            handleCompensation(booking, "Flight reservation error: " + e.getMessage());
        }
    }

    /**
     * Process hotel reservation step
     */
    private void processHotelReservation(Booking booking) {
        try {
            log.info("Processing hotel reservation for booking: {}", booking.getBookingReference());
            
            bookingDomainService.updateSagaState(booking.getBookingId(), SagaState.HOTEL_RESERVATION_PENDING);
            
            // Call hotel service to reserve
            boolean reserved = hotelBookingService.reserveHotel(booking);
            
            if (reserved) {
                bookingDomainService.updateSagaState(booking.getBookingId(), SagaState.HOTEL_RESERVED);
                log.info("Hotel reserved successfully for booking: {}", booking.getBookingReference());
                
                // If all reservations are done, proceed to payment
                processPayment(booking);
            } else {
                handleCompensation(booking, "Hotel reservation failed");
            }
            
        } catch (Exception e) {
            log.error("Error processing hotel reservation for booking: {}", booking.getBookingReference(), e);
            handleCompensation(booking, "Hotel reservation error: " + e.getMessage());
        }
    }

    /**
     * Process transport reservation step (for BUS, TRAIN)
     */
    private void processTransportReservation(Booking booking) {
        try {
            log.info("Processing transport reservation for booking: {}", booking.getBookingReference());
            
            // For now, we'll simulate transport reservation success
            // In real implementation, this would call transport-service
            bookingDomainService.updateSagaState(booking.getBookingId(), SagaState.BOOKING_COMPLETED);
            
            // Proceed to payment
            processPayment(booking);
            
        } catch (Exception e) {
            log.error("Error processing transport reservation for booking: {}", booking.getBookingReference(), e);
            handleCompensation(booking, "Transport reservation error: " + e.getMessage());
        }
    }

    /**
     * Process payment step
     */
    private void processPayment(Booking booking) {
        try {
            log.info("Processing payment for booking: {}", booking.getBookingReference());
            
            bookingDomainService.updateSagaState(booking.getBookingId(), SagaState.PAYMENT_PENDING);
            
            // Call payment service
            boolean paymentSuccess = paymentService.processPayment(booking);
            
            if (paymentSuccess) {
                bookingDomainService.updateSagaState(booking.getBookingId(), SagaState.PAYMENT_COMPLETED);
                log.info("Payment completed successfully for booking: {}", booking.getBookingReference());
                
                // Complete the booking
                completeBooking(booking);
            } else {
                handleCompensation(booking, "Payment processing failed");
            }
            
        } catch (Exception e) {
            log.error("Error processing payment for booking: {}", booking.getBookingReference(), e);
            handleCompensation(booking, "Payment error: " + e.getMessage());
        }
    }

    /**
     * Complete the booking saga
     */
    private void completeBooking(Booking booking) {
        try {
            log.info("Completing booking saga for: {}", booking.getBookingReference());
            
            // Generate confirmation number
            String confirmationNumber = generateConfirmationNumber(booking);
            
            // Confirm booking
            bookingDomainService.confirmBooking(booking.getBookingId(), confirmationNumber);
            
            // Send notification
            notificationService.sendBookingConfirmation(booking);
            
            log.info("Booking saga completed successfully for: {}", booking.getBookingReference());
            
        } catch (Exception e) {
            log.error("Error completing booking for: {}", booking.getBookingReference(), e);
            // Even if notification fails, we should not rollback the booking
            log.warn("Booking confirmed but notification might have failed");
        }
    }

    /**
     * Handle compensation (rollback) logic
     */
    private void handleCompensation(Booking booking, String reason) {
        try {
            log.warn("Starting compensation for booking: {}, reason: {}", booking.getBookingReference(), reason);
            
            // Update to failed status
            bookingDomainService.updateBookingStatus(booking.getBookingId(), BookingStatus.FAILED, SagaState.BOOKING_CANCELLED, reason);
            
            // Compensate in reverse order
            compensatePayment(booking);
            compensateHotelReservation(booking);
            compensateFlightReservation(booking);
            
            log.info("Compensation completed for booking: {}", booking.getBookingReference());
            
        } catch (Exception e) {
            log.error("Error during compensation for booking: {}", booking.getBookingReference(), e);
        }
    }

    /**
     * Compensate payment (refund)
     */
    private void compensatePayment(Booking booking) {
        try {
            paymentService.refundPayment(booking);
            log.info("Payment refunded for booking: {}", booking.getBookingReference());
        } catch (Exception e) {
            log.error("Error refunding payment for booking: {}", booking.getBookingReference(), e);
        }
    }

    /**
     * Compensate hotel reservation
     */
    private void compensateHotelReservation(Booking booking) {
        try {
            hotelBookingService.cancelHotelReservation(booking);
            log.info("Hotel reservation cancelled for booking: {}", booking.getBookingReference());
        } catch (Exception e) {
            log.error("Error cancelling hotel reservation for booking: {}", booking.getBookingReference(), e);
        }
    }

    /**
     * Compensate flight reservation
     */
    private void compensateFlightReservation(Booking booking) {
        try {
            flightBookingService.cancelFlightReservation(booking);
            log.info("Flight reservation cancelled for booking: {}", booking.getBookingReference());
        } catch (Exception e) {
            log.error("Error cancelling flight reservation for booking: {}", booking.getBookingReference(), e);
        }
    }

    /**
     * Generate confirmation number
     */
    private String generateConfirmationNumber(Booking booking) {
        return String.format("%s-%s", 
                booking.getBookingType().toString().substring(0, 2).toUpperCase(),
                booking.getBookingReference().substring(booking.getBookingReference().length() - 6));
    }

    /**
     * Find booking by saga ID
     */
    public Optional<Booking> findBySagaId(String sagaId) {
        return bookingDomainService.findBySagaId(sagaId);
    }
}
