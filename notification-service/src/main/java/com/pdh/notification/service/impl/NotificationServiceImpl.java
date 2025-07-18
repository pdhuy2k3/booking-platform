package com.pdh.notification.service.impl;

import com.pdh.common.outbox.service.OutboxEventService;
import com.pdh.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Implementation of NotificationService
 * Updated to use shared outbox implementation from common-lib
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final OutboxEventService eventPublisher;

    /**
     * Send notification and create outbox event using shared outbox implementation
     */
    @Override
    @Transactional
    public boolean sendNotification(String recipientId, String type, String subject, String message, String bookingId) {
        log.info("Sending {} notification to {}: {}", type, recipientId, subject);

        try {
            // In real implementation, this would send through appropriate channels (email, SMS, push)
            // For now, we'll simulate success and store it in the outbox for event processing
            String notificationId = "NOT-" + UUID.randomUUID().toString().substring(0, 8);

            // Create notification data
            Map<String, Object> notificationData = new HashMap<>();
            notificationData.put("notificationId", notificationId);
            notificationData.put("recipientId", recipientId);
            notificationData.put("type", type);
            notificationData.put("subject", subject);
            notificationData.put("message", message);
            notificationData.put("bookingId", bookingId);
            notificationData.put("sentTime", LocalDateTime.now().toString());
            notificationData.put("status", "sent");

            // Publish event using shared outbox implementation
            eventPublisher.publishEvent("NotificationSent", "Notification", notificationId.replace("NOT-", ""), notificationData);

            log.info("Notification sent successfully, outbox event created for notificationId: {}", notificationId);

            return true;
        } catch (Exception e) {
            log.error("Failed to send notification: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Get notification status
     */
    @Override
    public Object getNotificationStatus(String notificationId) {
        log.info("Getting notification status for ID: {}", notificationId);

        // In real implementation, this would retrieve status from notification store
        // For now, we'll return a mock status
        Map<String, Object> status = new HashMap<>();
        status.put("notificationId", notificationId);
        status.put("status", "delivered");
        status.put("deliveryDetails", Map.of(
                "email", Map.of("status", "delivered", "deliveredAt", LocalDateTime.now().minusMinutes(2).toString()),
                "push", Map.of("status", "delivered", "deliveredAt", LocalDateTime.now().minusMinutes(1).toString())
        ));
        status.put("checkedAt", LocalDateTime.now().toString());

        return status;
    }

    @Override
    @Transactional
    public void sendBookingConfirmation(UUID bookingId) {
        // Simulate sending a booking confirmation email
        log.info("Sending booking confirmation for booking: {}", bookingId);

        // Publish success event
        eventPublisher.publishEvent("BookingConfirmationSent", "Booking", bookingId.toString(), Map.of("bookingId", bookingId));
    }
}
