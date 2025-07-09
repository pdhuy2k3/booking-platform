package com.pdh.booking.outbox;

import com.pdh.booking.model.OutboxEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service for manual outbox event processing (LEGACY)
 * 
 * This service has been replaced by Debezium CDC (Change Data Capture) for automatic
 * real-time event publishing. Debezium monitors the outbox_events table and publishes
 * events to Kafka automatically with better performance and lower latency.
 * 
 * Scheduled methods are disabled but kept for emergency manual processing if needed.
 * 
 * @deprecated Use Debezium outbox connector for automatic event publishing
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Deprecated
public class OutboxMessageRelayService {
    
    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    // ObjectMapper removed - not used with Debezium approach
    
    /**
     * DISABLED: Using Debezium CDC for automatic outbox event processing
     * 
     * Debezium monitors the outbox_events table via PostgreSQL WAL and automatically
     * publishes events to Kafka topics in near real-time with better performance.
     * 
     * @deprecated Replaced by Debezium outbox connector
     */
    // @Scheduled(fixedDelay = 5000) // 5 seconds
    public void processOutboxEvents() {
        log.info("Scheduled outbox processing is disabled. Using Debezium CDC for automatic event publishing.");
        // Debezium handles this automatically via Change Data Capture
        /*
        try {
            List<OutboxEvent> unprocessedEvents = outboxEventRepository.findUnprocessedEventsOrderByCreatedAt();
            
            if (!unprocessedEvents.isEmpty()) {
                log.debug("Processing {} unprocessed outbox events", unprocessedEvents.size());
                
                for (OutboxEvent event : unprocessedEvents) {
                    processEvent(event);
                }
            }
            
        } catch (Exception e) {
            log.error("Error processing outbox events", e);
        }
        */
    }
    
    /**
     * DISABLED: Using Debezium CDC for automatic retry handling
     * 
     * Debezium provides built-in retry mechanisms and at-least-once delivery guarantees.
     * Failed events are automatically retried by Kafka Connect framework.
     * 
     * @deprecated Replaced by Debezium outbox connector with Kafka Connect retry policies
     */
    // @Scheduled(fixedDelay = 30000) // 30 seconds
    public void retryFailedEvents() {
        log.info("Scheduled retry processing is disabled. Using Debezium CDC with Kafka Connect retry policies.");
        // Debezium + Kafka Connect handles retries automatically
        /*
        try {
            List<OutboxEvent> retryableEvents = outboxEventRepository.findEventsReadyForRetry(LocalDateTime.now());
            
            if (!retryableEvents.isEmpty()) {
                log.debug("Retrying {} failed outbox events", retryableEvents.size());
                
                for (OutboxEvent event : retryableEvents) {
                    processEvent(event);
                }
            }
            
        } catch (Exception e) {
            log.error("Error retrying failed outbox events", e);
        }
        */
    }
    
    /**
     * Process a single outbox event
     */
    @Transactional
    public void processEvent(OutboxEvent event) {
        try {
            // Determine the Kafka topic based on event type or aggregate type
            String topic = determineKafkaTopic(event);
            
            // Create message key (typically the aggregate ID)
            String messageKey = event.getAggregateId();
            
            // Send to Kafka
            kafkaTemplate.send(topic, messageKey, event.getPayload())
                .thenAccept(result -> {
                    // Mark event as processed on successful send
                    markEventAsProcessed(event);
                })
                .exceptionally(throwable -> {
                    // Handle failure
                    handleEventFailure(event, throwable);
                    return null;
                });
                
        } catch (Exception e) {
            log.error("Error processing outbox event: {}", event.getEventId(), e);
            handleEventFailure(event, e);
        }
    }
    
    /**
     * Determine Kafka topic based on event type and aggregate type
     */
    private String determineKafkaTopic(OutboxEvent event) {
        String eventType = event.getEventType();
        String aggregateType = event.getAggregateType();
        
        // Topic naming convention: {aggregate-type}.{event-category}
        if (eventType.contains("Booking")) {
            return aggregateType.toLowerCase() + ".booking-events";
        } else if (eventType.contains("Payment")) {
            return aggregateType.toLowerCase() + ".payment-events";
        } else if (eventType.contains("Flight")) {
            return aggregateType.toLowerCase() + ".flight-events";
        } else if (eventType.contains("Hotel")) {
            return aggregateType.toLowerCase() + ".hotel-events";
        } else if (eventType.contains("Notification")) {
            return aggregateType.toLowerCase() + ".notification-events";
        } else {
            // Default topic
            return aggregateType.toLowerCase() + ".domain-events";
        }
    }
    
    /**
     * Mark event as successfully processed
     */
    @Transactional
    protected void markEventAsProcessed(OutboxEvent event) {
        try {
            event.setProcessed(true);
            event.setProcessedAt(LocalDateTime.now());
            event.setErrorMessage(null);
            outboxEventRepository.save(event);
            
            log.debug("Marked outbox event as processed: {}", event.getEventId());
            
        } catch (Exception e) {
            log.error("Error marking event as processed: {}", event.getEventId(), e);
        }
    }
    
    /**
     * Handle event processing failure
     */
    @Transactional
    protected void handleEventFailure(OutboxEvent event, Throwable throwable) {
        try {
            event.setRetryCount(event.getRetryCount() + 1);
            event.setErrorMessage(throwable.getMessage());
            
            if (event.getRetryCount() < event.getMaxRetries()) {
                // Schedule next retry with exponential backoff
                int delayMinutes = (int) Math.pow(2, event.getRetryCount()); // 2, 4, 8 minutes
                event.setNextRetryAt(LocalDateTime.now().plusMinutes(delayMinutes));
                
                log.warn("Event processing failed, scheduled for retry #{} in {} minutes: {}", 
                        event.getRetryCount(), delayMinutes, event.getEventId());
            } else {
                log.error("Event processing failed permanently after {} retries: {}", 
                         event.getMaxRetries(), event.getEventId());
            }
            
            outboxEventRepository.save(event);
            
        } catch (Exception e) {
            log.error("Error handling event failure for event: {}", event.getEventId(), e);
        }
    }
    
    /**
     * Get statistics about outbox events
     */
    public OutboxStatistics getStatistics() {
        long unprocessedCount = outboxEventRepository.countUnprocessedEvents();
        long failedCount = outboxEventRepository.countFailedEvents();
        
        return new OutboxStatistics(unprocessedCount, failedCount);
    }
    
    /**
     * Statistics data class
     */
    public static class OutboxStatistics {
        public final long unprocessedCount;
        public final long failedCount;
        
        public OutboxStatistics(long unprocessedCount, long failedCount) {
            this.unprocessedCount = unprocessedCount;
            this.failedCount = failedCount;
        }
    }
}
