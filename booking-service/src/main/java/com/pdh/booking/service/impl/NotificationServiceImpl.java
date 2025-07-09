package com.pdh.booking.service.impl;

import com.pdh.booking.config.ServiceUrlConfig;
import com.pdh.booking.model.Booking;
import com.pdh.booking.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Implementation of NotificationService
 * Handles notification operations via REST calls to Notification Service
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Primary
public class NotificationServiceImpl implements NotificationService {
    
    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrlConfig;
    
    // Notification Service endpoints - no /api/v1 prefix needed
    private static final String SEND_NOTIFICATION_URL = "/notifications/send";
    
    @Override
    public boolean sendBookingConfirmation(Booking booking) {
        log.info("Sending booking confirmation notification for booking: {}", booking.getBookingId());
        
        NotificationRequest request = NotificationRequest.builder()
            .recipientId(booking.getUserId().toString())
            .type("BOOKING_CONFIRMATION")
            .subject("Booking Confirmed - " + booking.getConfirmationNumber())
            .message("Your booking has been confirmed successfully.")
            .bookingId(booking.getBookingId().toString())
            .build();
            
        sendNotification(request);
        return true;
    }
    
    @Override
    public boolean sendBookingCancellation(Booking booking) {
        log.info("Sending booking cancellation notification for booking: {}", booking.getBookingId());
        
        NotificationRequest request = NotificationRequest.builder()
            .recipientId(booking.getUserId().toString())
            .type("BOOKING_CANCELLATION")
            .subject("Booking Cancelled")
            .message("Your booking has been cancelled. Reason: " + booking.getCancellationReason())
            .bookingId(booking.getBookingId().toString())
            .build();
            
        sendNotification(request);
        return true;
    }
    
    @Override
    public boolean sendBookingCancellationConfirmation(Booking booking) {
        log.info("Sending booking cancellation confirmation for booking: {}", booking.getBookingId());
        
        NotificationRequest request = NotificationRequest.builder()
            .recipientId(booking.getUserId().toString())
            .type("CANCELLATION_CONFIRMATION")
            .subject("Cancellation Confirmed")
            .message("Your booking cancellation has been processed. Any applicable refunds will be processed within 3-5 business days.")
            .bookingId(booking.getBookingId().toString())
            .build();
            
        sendNotification(request);
        return true;
    }
    
    @Override
    public boolean sendBookingStatusUpdate(Booking booking, String statusMessage) {
        log.info("Sending booking status update notification for booking: {}", booking.getBookingId());
        
        NotificationRequest request = NotificationRequest.builder()
            .recipientId(booking.getUserId().toString())
            .type("STATUS_UPDATE")
            .subject("Booking Status Update")
            .message(statusMessage)
            .bookingId(booking.getBookingId().toString())
            .build();
            
        sendNotification(request);
        return true;
    }
    
    @Override
    public boolean sendPaymentFailureNotification(Booking booking, String reason) {
        log.info("Sending payment failure notification for booking: {}", booking.getBookingId());
        
        NotificationRequest request = NotificationRequest.builder()
            .recipientId(booking.getUserId().toString())
            .type("PAYMENT_FAILURE")
            .subject("Payment Failed")
            .message("Payment for your booking failed. Reason: " + reason)
            .bookingId(booking.getBookingId().toString())
            .build();
            
        sendNotification(request);
        return true;
    }
    
    private boolean sendNotification(NotificationRequest request) {
        try {
            WebClient webClient = webClientBuilder
                .baseUrl(serviceUrlConfig.notificationService())
                .build();
            
            webClient.post()
                .uri(SEND_NOTIFICATION_URL)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .doOnSuccess(response -> log.info("Notification sent successfully: {}", response))
                .doOnError(error -> log.error("Notification sending failed: {}", error.getMessage()))
                .subscribe(); // Fire and forget
                
            return true;
        } catch (Exception e) {
            log.error("Error sending notification: {}", e.getMessage());
            // Don't throw exception for notifications - just log
            return false;
        }
    }
    
    // DTO class for notification service communication
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class NotificationRequest {
        private String recipientId;
        private String type;
        private String subject;
        private String message;
        private String bookingId;
    }
}
