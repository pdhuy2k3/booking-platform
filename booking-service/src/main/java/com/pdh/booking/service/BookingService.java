package com.pdh.booking.service;

import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.model.enums.BookingType;
import com.pdh.booking.repository.BookingRepository;
import com.pdh.common.utils.AuthenticationUtils;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Simplified Booking service using direct REST calls with circuit breakers
 * Replaces complex saga orchestration with synchronous service communication
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RestClient.Builder restClientBuilder;
    private final WebhookNotificationService webhookNotificationService;
    private final AnalyticsEventService analyticsEventService;

    /**
     * Create and process booking with direct service calls
     */
    @Transactional
    public Booking createBooking(Booking booking) {
        log.info("Creating booking with reference: {}", booking.getBookingReference());
        
        // Set user ID from authentication context
        booking.setUserId(UUID.fromString(AuthenticationUtils.extractUserId()));
        booking.setStatus(BookingStatus.PENDING);
        
        // Save booking first
        Booking savedBooking = bookingRepository.save(booking);
        
        // Publish analytics event for booking initiated
        analyticsEventService.publishBookingAnalyticsEvent(savedBooking, "booking.initiated");
        
        long startTime = System.currentTimeMillis();
        boolean success = false;
        
        try {
            // Process booking based on type using direct REST calls
            switch (booking.getBookingType()) {
                case FLIGHT -> processFlightBooking(savedBooking);
                case HOTEL -> processHotelBooking(savedBooking);
                case COMBO -> processComboBooking(savedBooking);
                default -> throw new IllegalArgumentException("Unsupported booking type: " + booking.getBookingType());
            }
            
            // If all services succeed, confirm booking
            savedBooking.setStatus(BookingStatus.CONFIRMED);
            savedBooking.setConfirmationNumber(generateConfirmationNumber());
            savedBooking = bookingRepository.save(savedBooking);
            
            // Send webhook notification for successful booking
            webhookNotificationService.sendBookingConfirmedNotification(savedBooking);
            
            // Publish analytics events for successful booking
            analyticsEventService.publishBookingAnalyticsEvent(savedBooking, "booking.confirmed");
            
            success = true;
            log.info("Booking {} processed successfully", savedBooking.getBookingReference());
            
        } catch (Exception e) {
            log.error("Error processing booking {}: {}", savedBooking.getBookingReference(), e.getMessage());
            
            // Mark booking as failed
            savedBooking.setStatus(BookingStatus.FAILED);
            savedBooking = bookingRepository.save(savedBooking);
            
            // Send webhook notification for failed booking
            webhookNotificationService.sendBookingFailedNotification(savedBooking, e.getMessage());
            
            // Publish analytics event for failed booking
            analyticsEventService.publishBookingAnalyticsEvent(savedBooking, "booking.failed");
            
            throw new BookingProcessingException("Failed to process booking: " + e.getMessage(), e);
        } finally {
            // Publish performance metrics
            long duration = System.currentTimeMillis() - startTime;
            analyticsEventService.publishPerformanceMetrics("booking.creation", duration, success);
        }
        
        return savedBooking;
    }

    /**
     * Process flight booking with circuit breaker
     */
    @CircuitBreaker(name = "flight-service", fallbackMethod = "flightServiceFallback")
    @Retry(name = "flight-service")
    private void processFlightBooking(Booking booking) {
        log.info("Processing flight booking: {}", booking.getBookingReference());
        
        RestClient restClient = restClientBuilder.build();
        
        // Call flight service using service discovery
        Map<String, Object> flightBookingRequest = Map.of(
            "bookingId", booking.getBookingId().toString(),
            "userId", booking.getUserId().toString(),
            "productDetails", booking.getProductDetailsJson(),
            "totalAmount", booking.getTotalAmount(),
            "currency", booking.getCurrency()
        );
        
        String response = restClient.post()
            .uri("http://flight-service/api/bookings")
            .contentType(MediaType.APPLICATION_JSON)
            .body(flightBookingRequest)
            .retrieve()
            .body(String.class);
            
        log.info("Flight booking processed successfully for booking: {}", booking.getBookingReference());
    }

    /**
     * Process hotel booking with circuit breaker
     */
    @CircuitBreaker(name = "hotel-service", fallbackMethod = "hotelServiceFallback")
    @Retry(name = "hotel-service")
    private void processHotelBooking(Booking booking) {
        log.info("Processing hotel booking: {}", booking.getBookingReference());
        
        RestClient restClient = restClientBuilder.build();
        
        Map<String, Object> hotelBookingRequest = Map.of(
            "bookingId", booking.getBookingId().toString(),
            "userId", booking.getUserId().toString(),
            "productDetails", booking.getProductDetailsJson(),
            "totalAmount", booking.getTotalAmount(),
            "currency", booking.getCurrency()
        );
        
        String response = restClient.post()
            .uri("http://hotel-service/api/bookings")
            .contentType(MediaType.APPLICATION_JSON)
            .body(hotelBookingRequest)
            .retrieve()
            .body(String.class);
            
        log.info("Hotel booking processed successfully for booking: {}", booking.getBookingReference());
    }

    /**
     * Process combo booking (both flight and hotel)
     */
    private void processComboBooking(Booking booking) {
        log.info("Processing combo booking: {}", booking.getBookingReference());
        
        // Process both flight and hotel
        processFlightBooking(booking);
        processHotelBooking(booking);
        
        log.info("Combo booking processed successfully for booking: {}", booking.getBookingReference());
    }

    /**
     * Process payment with circuit breaker
     */
    @CircuitBreaker(name = "payment-service", fallbackMethod = "paymentServiceFallback")
    @Retry(name = "payment-service")
    private void processPayment(Booking booking) {
        log.info("Processing payment for booking: {}", booking.getBookingReference());
        
        RestClient restClient = restClientBuilder.build();
        
        Map<String, Object> paymentRequest = Map.of(
            "bookingId", booking.getBookingId().toString(),
            "userId", booking.getUserId().toString(),
            "amount", booking.getTotalAmount(),
            "currency", booking.getCurrency(),
            "paymentMethod", "CREDIT_CARD" // This would come from request
        );
        
        String response = restClient.post()
            .uri("http://payment-service/api/payments")
            .contentType(MediaType.APPLICATION_JSON)
            .body(paymentRequest)
            .retrieve()
            .body(String.class);
            
        log.info("Payment processed successfully for booking: {}", booking.getBookingReference());
    }

    // Fallback methods
    private void flightServiceFallback(Booking booking, Exception ex) {
        log.error("Flight service fallback triggered for booking: {}, error: {}", 
                booking.getBookingReference(), ex.getMessage());
        throw new BookingProcessingException("Flight service unavailable", ex);
    }

    private void hotelServiceFallback(Booking booking, Exception ex) {
        log.error("Hotel service fallback triggered for booking: {}, error: {}", 
                booking.getBookingReference(), ex.getMessage());
        throw new BookingProcessingException("Hotel service unavailable", ex);
    }

    private void paymentServiceFallback(Booking booking, Exception ex) {
        log.error("Payment service fallback triggered for booking: {}, error: {}", 
                booking.getBookingReference(), ex.getMessage());
        throw new BookingProcessingException("Payment service unavailable", ex);
    }

    // Utility methods
    public Optional<Booking> findByBookingId(UUID bookingId) {
        return bookingRepository.findByBookingId(bookingId);
    }

    public Optional<Booking> findBySagaId(String sagaId) {
        return bookingRepository.findBySagaId(sagaId);
    }

    @Transactional
    public Optional<Booking> updateBookingStatus(UUID bookingId, BookingStatus newStatus) {
        return bookingRepository.findByBookingId(bookingId)
            .map(booking -> {
                booking.setStatus(newStatus);
                return bookingRepository.save(booking);
            });
    }

    private String generateConfirmationNumber() {
        return "CNF" + System.currentTimeMillis();
    }

    // Exception class
    public static class BookingProcessingException extends RuntimeException {
        public BookingProcessingException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
