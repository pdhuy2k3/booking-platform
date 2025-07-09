package com.pdh.notification.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.notification.model.Outbox;
import com.pdh.notification.repository.OutboxRepository;
import com.pdh.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Implementation of NotificationService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final OutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;

    /**
     * Send notification and create outbox event
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
            
            // Create outbox entry
            String eventPayload = objectMapper.writeValueAsString(notificationData);
            Outbox outboxEvent = new Outbox();
            outboxEvent.setId(UUID.randomUUID());
            outboxEvent.setAggregateType("notification");
            outboxEvent.setAggregateId(notificationId);
            outboxEvent.setEventType("NotificationSent");
            outboxEvent.setPayload(eventPayload);
            outboxEvent.setCreatedAt(LocalDateTime.now());
            
            outboxRepository.save(outboxEvent);
            log.info("Notification sent successfully, outbox event created: {}", outboxEvent.getId());
            
            return true;
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize notification data: {}", e.getMessage(), e);
            return false;
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
}
