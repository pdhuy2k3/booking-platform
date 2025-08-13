package com.pdh.booking.service;

import com.pdh.booking.model.Booking;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.ZonedDateTime;
import java.util.Map;

/**
 * Service for sending webhook notifications for booking events
 * Uses the new webhook service for reliable asynchronous notifications
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class WebhookNotificationService {

    private final RestClient.Builder restClientBuilder;

    /**
     * Send booking confirmed notification via webhook service
     */
    @CircuitBreaker(name = "webhook-service", fallbackMethod = "webhookServiceFallback")
    @Retry(name = "webhook-service")
    public void sendBookingConfirmedNotification(Booking booking) {
        log.info("Sending booking confirmed notification for booking: {}", booking.getBookingReference());
        
        RestClient restClient = restClientBuilder.build();
        
        Map<String, Object> webhookPayload = Map.of(
            "eventType", "booking.confirmed",
            "bookingId", booking.getBookingId().toString(),
            "bookingReference", booking.getBookingReference(),
            "userId", booking.getUserId().toString(),
            "totalAmount", booking.getTotalAmount(),
            "currency", booking.getCurrency(),
            "confirmationNumber", booking.getConfirmationNumber(),
            "timestamp", ZonedDateTime.now().toString()
        );
        
        restClient.post()
            .uri("http://webhook-service/api/webhooks/events")
            .contentType(MediaType.APPLICATION_JSON)
            .body(webhookPayload)
            .retrieve()
            .toBodilessEntity();
            
        log.info("Booking confirmed notification sent successfully for booking: {}", booking.getBookingReference());
    }

    /**
     * Send booking failed notification via webhook service
     */
    @CircuitBreaker(name = "webhook-service", fallbackMethod = "webhookServiceFallback")
    @Retry(name = "webhook-service")
    public void sendBookingFailedNotification(Booking booking, String failureReason) {
        log.info("Sending booking failed notification for booking: {}", booking.getBookingReference());
        
        RestClient restClient = restClientBuilder.build();
        
        Map<String, Object> webhookPayload = Map.of(
            "eventType", "booking.failed",
            "bookingId", booking.getBookingId().toString(),
            "bookingReference", booking.getBookingReference(),
            "userId", booking.getUserId().toString(),
            "totalAmount", booking.getTotalAmount(),
            "currency", booking.getCurrency(),
            "failureReason", failureReason,
            "timestamp", ZonedDateTime.now().toString()
        );
        
        restClient.post()
            .uri("http://webhook-service/api/webhooks/events")
            .contentType(MediaType.APPLICATION_JSON)
            .body(webhookPayload)
            .retrieve()
            .toBodilessEntity();
            
        log.info("Booking failed notification sent successfully for booking: {}", booking.getBookingReference());
    }

    /**
     * Send booking cancelled notification via webhook service
     */
    @CircuitBreaker(name = "webhook-service", fallbackMethod = "webhookServiceFallback")
    @Retry(name = "webhook-service")
    public void sendBookingCancelledNotification(Booking booking, String cancellationReason) {
        log.info("Sending booking cancelled notification for booking: {}", booking.getBookingReference());
        
        RestClient restClient = restClientBuilder.build();
        
        Map<String, Object> webhookPayload = Map.of(
            "eventType", "booking.cancelled",
            "bookingId", booking.getBookingId().toString(),
            "bookingReference", booking.getBookingReference(),
            "userId", booking.getUserId().toString(),
            "totalAmount", booking.getTotalAmount(),
            "currency", booking.getCurrency(),
            "cancellationReason", cancellationReason,
            "timestamp", ZonedDateTime.now().toString()
        );
        
        restClient.post()
            .uri("http://webhook-service/api/webhooks/events")
            .contentType(MediaType.APPLICATION_JSON)
            .body(webhookPayload)
            .retrieve()
            .toBodilessEntity();
            
        log.info("Booking cancelled notification sent successfully for booking: {}", booking.getBookingReference());
    }

    /**
     * Fallback method for webhook service failures
     */
    private void webhookServiceFallback(Booking booking, String reason, Exception ex) {
        log.warn("Webhook service fallback triggered for booking: {}, reason: {}, error: {}", 
                booking.getBookingReference(), reason, ex.getMessage());
        // In a real scenario, you might want to store failed notifications for retry
        // or use a dead letter queue
    }

    private void webhookServiceFallback(Booking booking, Exception ex) {
        webhookServiceFallback(booking, "unknown", ex);
    }
}
