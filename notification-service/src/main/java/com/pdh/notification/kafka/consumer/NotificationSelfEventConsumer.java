package com.pdh.notification.kafka.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.kafka.consumer.BaseSelfEventConsumer;
import com.pdh.common.outbox.service.EventDeduplicationServiceInterface;
import com.pdh.notification.model.NotificationOutboxEvent;
import com.pdh.notification.repository.NotificationOutboxEventRepository;
import com.pdh.notification.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

import static org.springframework.kafka.support.KafkaHeaders.RECEIVED_KEY;
import static org.springframework.kafka.support.KafkaHeaders.RECEIVED_TOPIC;

/**
 * Notification Self-Event Consumer for Listen to Yourself Pattern
 * Processes events that the notification service itself has published
 */
@Component
@Slf4j
public class NotificationSelfEventConsumer extends BaseSelfEventConsumer<String> {
    
    private final NotificationService notificationService;
    private final NotificationOutboxEventRepository outboxEventRepository;
    private static final String SERVICE_NAME = "notification-service";
    
    public NotificationSelfEventConsumer(
            EventDeduplicationServiceInterface deduplicationService,
            ObjectMapper objectMapper,
            NotificationService notificationService,
            NotificationOutboxEventRepository outboxEventRepository) {
        super(deduplicationService, objectMapper);
        this.notificationService = notificationService;
        this.outboxEventRepository = outboxEventRepository;
    }
    
    /**
     * Listen to notification service's own events
     */
    @KafkaListener(
        topics = "booking.Notification.events",
        groupId = "notification-service-self-group",
        containerFactory = "notificationEventListenerContainerFactory"
    )
    public void handleNotificationSelfEvent(
        @Payload String message,
        @Header(RECEIVED_KEY) String key,
        @Header(RECEIVED_TOPIC) String topic
    ) {
        log.info("Received notification self-event from topic {}: key={}, message={}", topic, key, message);
        processSelfEvent(message, SERVICE_NAME);
    }
    
    @Override
    protected String extractEventId(String message) {
        try {
            JsonNode jsonNode = objectMapper.readTree(message);
            return jsonNode.has("eventId") ? jsonNode.get("eventId").asText() : 
                   jsonNode.has("id") ? jsonNode.get("id").asText() : null;
        } catch (Exception e) {
            log.error("Failed to extract event ID from message: {}", message, e);
            return null;
        }
    }
    
    @Override
    protected String extractEventType(String message) {
        try {
            JsonNode jsonNode = objectMapper.readTree(message);
            return jsonNode.has("eventType") ? jsonNode.get("eventType").asText() : 
                   jsonNode.has("event_type") ? jsonNode.get("event_type").asText() : null;
        } catch (Exception e) {
            log.error("Failed to extract event type from message: {}", message, e);
            return null;
        }
    }
    
    @Override
    protected String extractAggregateId(String message) {
        try {
            JsonNode jsonNode = objectMapper.readTree(message);
            return jsonNode.has("aggregateId") ? jsonNode.get("aggregateId").asText() : 
                   jsonNode.has("aggregate_id") ? jsonNode.get("aggregate_id").asText() : null;
        } catch (Exception e) {
            log.error("Failed to extract aggregate ID from message: {}", message, e);
            return null;
        }
    }
    
    @Override
    protected boolean handleSelfEvent(String eventId, String eventType, String aggregateId, String message) {
        try {
            log.info("Processing notification self-event: eventId={}, eventType={}, aggregateId={}", 
                    eventId, eventType, aggregateId);
            
            switch (eventType) {
                case "NotificationSent":
                    return handleNotificationSentSelfEvent(eventId, aggregateId, message);
                case "NotificationFailed":
                    return handleNotificationFailedSelfEvent(eventId, aggregateId, message);
                case "NotificationDelivered":
                    return handleNotificationDeliveredSelfEvent(eventId, aggregateId, message);
                case "NotificationRead":
                    return handleNotificationReadSelfEvent(eventId, aggregateId, message);
                default:
                    log.warn("Unknown notification self-event type: {}", eventType);
                    return true; // Consider unknown events as processed to avoid infinite loops
            }
        } catch (Exception e) {
            log.error("Error handling notification self-event: eventId={}, eventType={}", eventId, eventType, e);
            return false;
        }
    }
    
    private boolean handleNotificationSentSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String notificationId = payload.has("notificationId") ? payload.get("notificationId").asText() : aggregateId;
            String recipient = payload.has("recipient") ? payload.get("recipient").asText() : null;
            
            log.info("Verifying notification sent: notificationId={}, recipient={}", notificationId, recipient);
            
            // Verify that the notification was actually sent
            boolean notificationSent = notificationService.verifyNotificationSent(UUID.fromString(notificationId));
            
            if (!notificationSent) {
                log.error("Notification sent verification failed: notificationId={}", notificationId);
                // Could trigger retry or alert
                return false;
            }
            
            log.info("Notification sent verified successfully: notificationId={}", notificationId);
            return true;
            
        } catch (Exception e) {
            log.error("Error handling NotificationSent self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    private boolean handleNotificationFailedSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String notificationId = payload.has("notificationId") ? payload.get("notificationId").asText() : aggregateId;
            String reason = payload.has("reason") ? payload.get("reason").asText() : "Unknown";
            
            log.info("Verifying notification failure: notificationId={}, reason={}", notificationId, reason);
            
            // Verify that the notification is indeed in failed state
            boolean failureVerified = notificationService.verifyNotificationFailure(UUID.fromString(notificationId));
            
            if (!failureVerified) {
                log.warn("Notification failure verification failed: notificationId={}", notificationId);
            }
            
            return true; // Always consider failure events as processed
            
        } catch (Exception e) {
            log.error("Error handling NotificationFailed self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    private boolean handleNotificationDeliveredSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String notificationId = payload.has("notificationId") ? payload.get("notificationId").asText() : aggregateId;
            
            log.info("Verifying notification delivery: notificationId={}", notificationId);
            
            // Verify that the notification was delivered
            boolean deliveryVerified = notificationService.verifyNotificationDelivery(UUID.fromString(notificationId));
            
            if (!deliveryVerified) {
                log.warn("Notification delivery verification failed: notificationId={}", notificationId);
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("Error handling NotificationDelivered self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    private boolean handleNotificationReadSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String notificationId = payload.has("notificationId") ? payload.get("notificationId").asText() : aggregateId;
            
            log.info("Verifying notification read: notificationId={}", notificationId);
            
            // Verify that the notification was read
            boolean readVerified = notificationService.verifyNotificationRead(UUID.fromString(notificationId));
            
            if (!readVerified) {
                log.warn("Notification read verification failed: notificationId={}", notificationId);
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("Error handling NotificationRead self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    @Override
    protected void updateSelfProcessedStatus(String eventId, boolean processed) {
        try {
            Optional<NotificationOutboxEvent> eventOpt = outboxEventRepository.findByEventId(eventId);
            if (eventOpt.isPresent()) {
                NotificationOutboxEvent event = eventOpt.get();
                if (processed) {
                    event.markAsSelfProcessed();
                } else {
                    event.incrementProcessingAttempts();
                }
                outboxEventRepository.save(event);
                log.debug("Updated self-processed status for notification event {}: {}", eventId, processed);
            } else {
                log.warn("Notification outbox event not found for eventId: {}", eventId);
            }
        } catch (Exception e) {
            log.error("Error updating self-processed status for notification event {}", eventId, e);
        }
    }
}
